import { printErrorOnConsole } from "../helpers/Util";

/**
 * An array of objects with the regex of the available functions for the user and the type of treatment the parser will do to the functions.
 * Types: "sequential" stands for functions that has can't be executed synchronously with other functions;
 * "normal" stands for execute the function without a previous treatment.
 */
const functionFilter = [
    {
        filter: new RegExp('^andarFrente(\\s+)?\\((\\s+)?\\d+(\\s+)?\\)(\\s+)?(;)?$'),
        type: 'sequential'
    },
    {
        filter: new RegExp('^andarTras(\\s+)?\\((\\s+)?\\d+(\\s+)?\\)(\\s+)?(;)?$'),
        type: 'sequential'
    },
    {
        filter: new RegExp('^girarEsquerda(\\s+)?\\((\\s+)?\\)(\\s+)?(;)?$'),
        type: 'sequential'
    },
    {
        filter: new RegExp('^girarDireita(\\s+)?\\((\\s+)?\\)(\\s+)?(;)?$'),
        type: 'sequential'
    },
    {
        filter: new RegExp('^darMeiaVolta(\\s+)?\\((\\s+)?\\)(\\s+)?(;)?$'),
        type: 'sequential'
    },
    {
        filter: new RegExp('^coletarCristal(\\s+)?\\((\\s+)?\\)(\\s+)?(;)?$'),
        type: 'normal'
    }
]

/**
 * Parses the code typed by the user. If it's valid, returns a processed string with the code ready to be executed. If not, returns null.  
 * @param {string} code - The code typed by the user.
 * @returns {string | null}
 */
export function parseCode(code)
{
    let codeParsed = "async function runCode(){\n";
    let lines = code.split('\n')
    let valid = true
    for(let i = 0;i < lines.length;i++)
    {
        let validLine = false
        let lineType
        if(lines[i].trim() != "")
        {
            for(let j = 0;j < functionFilter.length;j++)
            {
                validLine = functionFilter[j].filter.test(lines[i].trim())
                if(validLine)
                {
                    lineType = functionFilter[j].type   
                    break
                }
            }
            if(validLine)
            {
                if(lineType === "sequential")
                {
                    let lineParsed = "await " + lines[i].trim() + "\n"
                    codeParsed += lineParsed
                }
                else
                {
                    let lineParsed = lines[i].trim() + "\n"
                    codeParsed += lineParsed   
                }
            }
            else
            {
                printErrorOnConsole(lines[i],i+1)
                valid = false
                break
            }
        }
        else
        {
            continue
        }
    }

    if(valid)
    {
        codeParsed += "}\nrunCode()"
        return codeParsed
    }
    else
    {
        return null
    }
}