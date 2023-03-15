import {program} from "./cli"
import * as fs from "fs"


const genDocs = (): string => {
  let output = ""
  const append = (text: string, lineFeed = true) => output += text += lineFeed ?"\n" : ""
  append('# Command help')
  append("```")
  append(program.helpInformation(), false)
  append("```")
  append('# Subcommands')
  program.commands.forEach(c => {
    append(`## ${c.name()}`)
    append("```")
    append(c.helpInformation(), false)
    append("```")
  })
  return output
}

const replaceReadmeDoc = (): string => {
  let output = ""
  const append = (text: string) => output += text += "\n"
  const readmeFileLines = fs.readFileSync("../../README.md").toString().split("\n")

  let beginningFound = false
  let endFound = false

  readmeFileLines.forEach(line => {
    if(line.startsWith("<!-- START_DOC")) {
      beginningFound = true
      append(line)
      append(genDocs())
    } else if(line.startsWith("<!-- END_DOC")) {
      endFound = true
      append(line)
    } else {
      if(!beginningFound || endFound) {
        append(line)
      }
    }
  })
  return output
}

const replacedReadmeDoc = replaceReadmeDoc()

fs.writeFileSync("../../README.md", replacedReadmeDoc)
