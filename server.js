import express from 'express'
import 'dotenv/config'
import { update_yt_dlp, download, get_videoId, get_video } from './sh.js'
import { get_available_resolutions, get_default_resolution, encode_fullwidth } from './helpers.js'

const app = express()
const port = Number(process.env.PORT)

app.get('/', (req, res) => {
    const resolutions = get_available_resolutions()
    const default_res = get_default_resolution()

    res.send(`
        <h2>To use the YouTube Video Download Server:</h2>
        <p>
        To extract a downloadable file of a YouTube video, GET request the /extract endpoint with the query param "url" set to the video's URL.
        </p>
        <p>
        To specify the resolution, add the query parameter "res" and set it to the wanted resolution (default is ${default_res}p).
        </p>
        <p>
        To download a local file, GET request the /download endpoint with the query param "url" set to the video's URL.
        </p>

        <h2>The Available Resolutions:</h2>
        <p>${ JSON.stringify(resolutions, null, 2) }</p>
    `)
})

app.get('/help', (req, res) => {
    res.redirect('/')
})

app.get('/extract', async (req, res, next) => {
    // Asynchronously update yt-dlp
    // Middleware
    
    try {
        update_yt_dlp()
    }
    catch (err) {
        res.status(500)
        
        return res.send(`${err}\n${err.message}`)
    }

    next()

}, async (req, res, next) => {
    // Check if youtube url is valid 
    // Check the status of API request
    // Works with https://youtu.be/:id
    // Fails when embedding is off. Check for 401 status???

    if (!('url' in req.query)) {
        res.status(400)

        return res.send('400 Param "url" is not included in request.')
    }

    const url = req.query.url
    const validation_url = `https://www.youtube.com/oembed?format=json&url=${url}`

    try {
        const response = await fetch(validation_url)

        if (!response.ok) {

            // Not embeddable but valid url
            if (response.status == 401) {
                console.log(`${url} is not embeddable.`)

                next()
            }
            else {
                res.status(response.status)

                return res.send(`${response.status} URL is not valid.`)
            }
        }

    }
    catch (err) {
        res.status(500)
        console.error(err)
        
        return res.send(`${err}\n${err.message}`)
    }

    next()

    // Check if requested file contains windows illegal characters and replace them
    // As middleware

}, async (req, res) => {
    // Download file onto local system

    const url = req.query.url

    try {
        let resolution;
        let output;

        if ('res' in req.query) {
            resolution = Number(req.query.res)
            output = await download(url, resolution)
        }
        else {
            output = await download(url)
            resolution = get_default_resolution()

            // TODO: Throw error if yt-dlp fails
        }

        if (req.query.format == 'json') {
            const json = { 
                download: `/download?url=${url}`, 
                video: url, 
                resolution: resolution
            }

            return res.json(json)
        }

        return res.send(
            `<a href="${url}">Video</a> successfully downloaded in ${resolution}p. <a href="/download?url=${url}">Local Download Available.</a>`
        )
    }
    catch (err) {
        res.status(500)
        console.error(err)
        
        return res.send(`${err}\n${err.message}`)
    }
})

app.get('/download', async (req, res, next) => {
    // Check if youtube url is valid 
    // Check the status of API request
    // Works with https://youtu.be/:id

    if (!('url' in req.query)) {
        res.status(400)

        return res.send('400 Param "url" is not included in request.')
    }

    const url = req.query.url
    const validation_url = `https://www.youtube.com/oembed?format=json&url=${url}`

    try {
        const response = await fetch(validation_url)

        if (!response.ok) {

            // Not embeddable
            if (response.status == 401) {
                console.log(`${url} is not embeddable.`)
            }
            else {
                res.status(response.status)

                return res.send(`${response.status} URL is not valid.`)
            }
        }

    }
    catch (err) {
        res.status(500)
        console.error(err)
        
        return res.send(`${err}\n${err.message}`)
    }

    next()

}, async (req, res) => {
    // TODO: Search for file with id
    // Get path to file and send
    // dir -n *.mov *.mp4 *.avi *.webm | findstr "id"

    try {
        const url = req.query.url
        const id =  get_videoId(url)

        const filename = await get_video(id)
        const safe_file = encode_fullwidth(filename)
        const path = `${process.env.DIR}\\${safe_file}`

        res.download(path)
    }
    catch (err) {
        if (!res.headersSent) {
            res.status(500)
            console.error(err)
        
            return res.send(`${err}\n${err.message}`)
        }
    }
})

app.listen(port, () => { 
    console.log(`Server listening on port ${port}.`)
})