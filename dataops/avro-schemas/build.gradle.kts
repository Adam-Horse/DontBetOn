import java.net.URI
import java.util.Properties
import java.io.FileInputStream

plugins {
    base 
}

// Load local properties
val localProperties = Properties().apply {
    rootProject.file("local.properties").reader().use(::load)
}

// Configuration variables from local.properties
val avroToolsVersion = localProperties.getProperty("config.avro.tools.version", "1.12.0")
val avroToolsUrl = localProperties.getProperty("config.avro.tools.url", "https://repo1.maven.org/maven2/org/apache/avro/avro-tools/$avroToolsVersion/avro-tools-$avroToolsVersion.jar")
val avroToolsDir = localProperties.getProperty("config.avro.tools.output.dir", "$rootDir/tools")

// Paths and file references
val avroToolsUri = URI(avroToolsUrl.replace("{{version}}", avroToolsVersion))
val avroToolsFile = File("$rootDir/$avroToolsDir", "avro-tools-$avroToolsVersion.jar")
val srcDir = file("${projectDir}/src")
val avroAvdlDir = file("${buildDir}/avdl")
val avroAvscDir = file("${buildDir}/avsc")

// Precompiled regular expressions
val includeRegex = Regex("//\\s*@include\\s*\\{\\{\\s*(.*?)\\s*\\}\\}")
val recordContentRegex = Regex("record\\s+\\w+\\s*\\{((?:[^{}]*|\\{(?:[^{}]*|\\{[^{}]*\\})*\\})*)\\}", RegexOption.DOT_MATCHES_ALL)


/**
 * Function to download avro-tools.jar if not present
 */
fun downloadAvroTools() {
    if (!avroToolsFile.exists()) {
        avroToolsFile.parentFile.mkdirs()
        avroToolsUri.toURL().openStream().use { input ->
            avroToolsFile.outputStream().use { output ->
                input.copyTo(output)
            }
        }
        println("Downloaded avro-tools-$avroToolsVersion to $avroToolsDir")
    }
}

/**
 * Processes Avro IDL files, replacing @include directives recursively.
 */
fun processFile(file: File, processedFiles: MutableSet<File>): String {
    if (file in processedFiles) {
        throw IllegalArgumentException("Circular include detected for file: ${file.path}")
    }
    processedFiles.add(file)

    var content = file.readText()

    content = includeRegex.replace(content) { matchResult ->
        val includedFileName = matchResult.groupValues[1]
        val includedFile = File(file.parentFile, includedFileName)
        if (!includedFile.exists()) {
            throw IllegalArgumentException("Included file not found: ${includedFile.path}")
        }
        val includedContent = processFile(includedFile, processedFiles)
        val recordContent = recordContentRegex.find(includedContent)?.groupValues?.get(1) ?: includedContent.trim()
        "// imported from $includedFileName$recordContent"
    }

    processedFiles.remove(file)
    return content
}

/**
 * Task: Download avro-tools to compile Avro IDL files.
 */
tasks.register("downloadAvroTools") {
    outputs.file(avroToolsFile)
    doLast {
        downloadAvroTools()
    }
}

/**
 * Task: Process Avro templates by resolving @include directives.
 */
tasks.register("processAvroTemplates") {
    inputs.dir(srcDir).withPropertyName("inputDir").withPathSensitivity(PathSensitivity.RELATIVE)
    outputs.dir(avroAvdlDir).withPropertyName("outputDir")

    doLast {

        // Process each .avdl file in the input directory
        srcDir.walkTopDown().filter { it.isFile && it.extension == "avdl" }.forEach { idlFile ->
            val outputDir = avroAvdlDir
            // use the same relative folder structure as the input directory
            val relativePath = idlFile.relativeTo(srcDir).path.toString().replace(".template.avdl", ".avdl")
            val outputFile = File(outputDir, relativePath)

            outputFile.parentFile.mkdirs()

            if (idlFile.name.endsWith(".template.avdl")) {
                val processedFiles = mutableSetOf<File>()
                val content = processFile(idlFile, processedFiles)
                outputFile.writeText(content)
            } else {
                outputFile.writeText(idlFile.readText())
            }
        }
    }
}

/**
 * Task: Convert processed Avro IDL files to AVSC using avro-tools, but only if the file contains the `// @convert` directive.
 */
tasks.register("convertAvdlToAvsc") {
    dependsOn("processAvroTemplates", "downloadAvroTools")
    inputs.dir(avroAvdlDir).withPropertyName("inputDir")
    outputs.dir(avroAvscDir).withPropertyName("outputDir")

    // Regex to find the `// @convert` directive
    val convertDirectiveRegex = Regex("//\\s*@convert")

    doLast {
        avroAvdlDir.walkTopDown().filter { it.isFile && it.extension == "avdl" }.forEach { file ->
            // Only convert files that contain the `// @convert` directive
            val fileContent = file.readText()
            if (convertDirectiveRegex.containsMatchIn(fileContent)) {
                val relativePath = file.relativeTo(avroAvdlDir).path.removeSuffix(".avdl") + ".avsc"
                val outputFile = File(avroAvscDir, relativePath)
                outputFile.parentFile.mkdirs()

                // Run avro-tools idl to convert .avdl to .avsc
                val command = listOf("java", "-jar", avroToolsFile.absolutePath, "idl", file.absolutePath, outputFile.absolutePath)

                val process = ProcessBuilder(command)
                    .redirectErrorStream(true) // Combine stdout and stderr
                    .start()

                // Capture both output and error streams for verbosity
                val output = process.inputStream.bufferedReader().use { it.readText() }
                val exitCode = process.waitFor()

                if (exitCode != 0) {
                    println("Error converting ${file.absolutePath}")
                    println("avro-tools command output:")
                    println(output) // Print the combined stdout and stderr output
                    throw GradleException("avro-tools idl failed for ${file.absolutePath} with exit code $exitCode")
                } 
            } else {
                println("Skipped conversion for ${file.name}, no `// @convert` directive found.")
            }
        }
    }
}


/**
 * Main build task.
 */
tasks.named("build") {
    dependsOn("convertAvdlToAvsc")
}
