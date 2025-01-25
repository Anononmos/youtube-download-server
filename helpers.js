import "dotenv/config"

// Contains helper functions such as converting illegal filename characters to fullwidth unicode characters.

export function get_available_resolutions() {
    // Gets available resolutions stored in env file

    const str_resolutions = process.env.RESOLUTIONS.split(',')

    // Cast each resolution to Number
    const resolutions = str_resolutions.map(Number)

    return resolutions
}


export function get_default_resolution() {
    // Gets the default resolution

    const default_res = Number(process.env.DEFAULT_RES)

    return default_res
}


export function encode_fullwidth(str) {
    // converts illegal filename characters to their fullwidth counterparts

    const forbidden = /[<>:;"/\\|?*]/g

    const replacer = (match, offset, string) => {
        let replacement; 

        // Encode to fullwidth by adding 65 248 to character code 0xFEE0

        const prev = str[offset - 1]
        const next = str[offset + 1]

        replacement = encode_quotes("\'", match, prev, next)

        if (replacement) {
            return replacement
        }

        replacement = encode_quotes("\"", match, prev, next)

        if (replacement) {
            return replacement
        }

        const code = string.charCodeAt(offset)
        replacement = String.fromCharCode(code + 0xFEE0)

        return replacement
    }

    return str.replace(forbidden, replacer)
}


function encode_quotes(quote, match, prev, next) {
    // Matches regular single and double quotes with unicode variants

    const punctuation = /[.,;?! ]/g

    // Single and double quotes

    const pairwise_map = {
        '\'': ['\u2018', '\u2019'], 
        '\"': ['\u201C', '\u201D']
    }

    if (match == quote) {
        // Beginning quotes

        if (prev === undefined) {
            const leftquote = pairwise_map[quote][0]

            return leftquote
        }

        if (prev == ' ') {
            const leftquote = pairwise_map[quote][0]

            return leftquote
        }

        // Ending quotes

        if (next === undefined) {
            const rightquote = pairwise_map[quote][1]

            return rightquote
        }

        if (next.match(punctuation)) {
            const rightquote = pairwise_map[quote][1]

            return rightquote
        }
    }
    // Return false if character is not 

    else {
        return false
    }
}