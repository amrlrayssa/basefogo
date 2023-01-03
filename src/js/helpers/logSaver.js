const FORM_ACCESS = 'https://docs.google.com/forms/d/e/1FAIpQLSeTbA3iFSmgcNeCaFKuXEKQ0mOBg74mow2ISXzESXOI4afhOQ/formResponse'

/**
 * Send a log with the help of a embeded GF, it normally shows a CORS errors, but it sends the data anyway
 * @async
 * @param {Array<Array<string>>} data - The data that will be sent to the form
 * @returns {Promise<boolean>}
 */
export async function saveLog(data)
{
    let xhr = new XMLHttpRequest()
    xhr.open('POST',FORM_ACCESS,true)

    let formData = new FormData()
    for(let i = 0; i < data.length;i++)
    {
        formData.append(data[i][0],data[i][1])
    }

    xhr.send(formData)

    return true
}

