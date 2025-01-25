import { spawn, spawnSync } from 'child_process'
import { once } from 'events'
import 'dotenv/config'
import { get_available_resolutions } from './helpers.js'

// Location of shell related functions i.e., download onto local computer, validation of input URLs

function format_command(command, params) {
    // Takes in a command string
    // Params are marked as $ followed by index of command
    // Returns command as list split by space except anything in quotes

    let f_cmd = command
    const split_regex = /(?:[^\s"]+|"[^"]*")+/g   // Splits string by space without affecting quotes

    for (const [i, param] of params.entries()) {
        const label = '$' + i

        f_cmd = f_cmd.replaceAll(label, param)
    }

    return f_cmd.match(split_regex)
}

export async function update_yt_dlp() {
    const cmd = process.env.UPGRADE

    const child = spawn(cmd, {
        shell: true, 
        detached: true, 
        stdio: ['ignore', 'pipe']
    })
}

export async function download(url, res=1080) {
    const resolutions = get_available_resolutions()
    let output = ''
    let error = ''

    if (!resolutions.includes(res)) {
        throw new Error(`Error!: ${res} is not a valid resolution.`)
    }

    // Download command yt-dlp

    const downloader = process.env.DOWNLOAD
    const output_dir = process.env.OUTPUT
    const [cmd, ...params] = format_command(downloader, [res, output_dir, url])

    // Exexcute yt-dlp to download video

    console.log('cmd:', cmd)
    console.log('params:', params)

    const child = spawn(cmd, params, {
        shell: true
    })

    child.stdout.on('data', data => {
        console.log('stdout output:', data.toString())

        output += data.toString()
    })

    child.stderr.on('data', data => {
        error += data.toString()

        console.error('error:', data.toString())
    })

    await once(child, 'close')

    return output
}

export async function get_video(id) {
    let file= ''
    let error = ''

    const searcher = process.env.SEARCH
    const dir = process.env.DIR
    const [cmd, ...params] = format_command(searcher, [dir, id])

    const child = spawn(cmd, params, {
        shell: true
    })

    child.stdout.on('data', data => {
        console.log('stdout output:', data.toString())
        file += data.toString()
    })

    child.stderr.on('data', data => {
        error += data.toString()

        console.error('error:', data.toString())
    })

    await once(child, 'close')

    return file.trimEnd()
}

export function get_videoId(url) {
    // Split at '?' for queries
    // Split at '&' to get results
    // Search for 'v='
    // Split at '='

    const base1 = 'https://www.youtube.com/watch?v='
    const base2 = 'https://youtu.be/'

    if (!url.includes(base1) && !url.includes(base2)) {
        throw new Error('Error! Url is of invalid format. Includes neither of two formats.')
    }

    if (url.includes(base1) && url.includes(base2)) {
        throw new Error('Error! Url is of invalid format. Includes both formats.')
    }

    // Extract the video id, i.e., v query parameter

    if (url.includes(base1)) {
        const querystring = url.split('?')[1]
        const param = querystring.split('&').find(query => query.match(/^v=/))
        const v = param.split('=')[1]

        return v
    }

    if (url.includes(base2)) {
        const params = url.split('/')[3]
        const v = params.split('?')[0]

        return v
    }
}