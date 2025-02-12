# YouTube Video Download Server:

## Author: Ainan Kashif
## Year: 2024

This is an HTTP server that downloads YouTube videos onto the host machine and sends out those local files upon request. 

To start the server, just execute the command ```node server.js``` in the project directory. The server can be accessed through localhost or the local IP address.

## Endpoints

| Endpoint | Description |
|----------|-------------|
/ | The root endpoint. Gives instructions on how to use the server.
/help | Redirects to the root endpoint.
/extract?url={url} | Download a YouTube video onto the server with the default resolution. <br> Set the url query parameter to the video's URL.
/extract?res={resolution}&url={url} | Download a YouTube video onto the server with a specified resolution. <br> Set the res query parameter to the wanted resolution as a number. <br> Set the url query parameter to the video's URL.
/download?url={url} | Downloads the YouTube video specified by the URL off the server.

## Setup

The server's setup requires NodeJS and a shell command that downloads YouTube videos e.g. yt-dlp to work. 

The installation guide for yt-dlp can be found __[Here](https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#installation)__. 

Run ```npm install``` to install all the required dependencies listed in the ```package.json``` file.

### Environment Variables

A ```.env``` file is used to store sensitive data about the server and the commands used in downloading. The environment variables listed below must be included inside the ```.env``` file:

### Basic Variables

| Variable | Description |
|----------|-------------|
```PORT``` | The port that the server is hosted on. 
```UPGRADE``` | The command to update the shell command that downloads the YouTube video. <br> To update yt-dlp run the following command: ```pip install -U yt-dlp[default]```.
```OUTPUT``` | The path to the directory on the server where videos are downloaded to. Linux style paths (using foreward slashes) are used as paths in yt-dlp commands. <br> This is why there are two directory variables.
```DIR``` | The path to the directory on the server where video files are stored to then be sent for download upon request to the /download endpoint. <br> If running on a Windows machine, the path must use back slashes. Unix machines will use foreward slashes in their file paths.
```RESOLUTIONS``` | The available resolutions for download as a comma-separated list. <br> A list of standard YouTube resolutions would be written as follows: ```144,240,360,480,720,1080,1440,2160,4320```
```DEFAULT_RES``` | The default resolution to download YouTube videos at.

### Commands with Inputs

To specify arguments for commands that are saved in the ```.env``` file, a placeholder such as ```$0``` can be used. Commands with inputs in the ```.env``` file are parsed before being executed using the ```format_command``` funtion in the ```sh.js``` file. This function has two inputs: 

```command```:  The unparsed command string as specified in the ```.env``` file.

```params```:   The list of inputted values into the command following the positional order specified in the ```.env``` file.

For example: 

```cat $0 > $1```

Above, the ```$0``` is the first argument for the command while ```$1``` is the second argument, so the resulting call to ```format_command``` would be:

```const [cmd, ...params] = format_command("cat $0 > $1", ["input.txt", "output.txt"]);```

```format_command``` returns the formatted command as a list by splitting the string along its spaces, excluding spaces that are enclosed by double quotes.

### <strong>Important!</strong>

If using a custom command with parameters, you must update the ```params``` parameter in the calls to the ```format_command``` function. That means updating the following code segments: 

Lines 46-48 in ```sh.js```:

```javascript
const downloader = process.env.DOWNLOAD
const output_dir = process.env.OUTPUT
const [cmd, ...params] = format_command(downloader, [res, output_dir, url])
```

Lines 80-82 in ```sh.js```:

```javascript
const searcher = process.env.SEARCH
const dir = process.env.DIR
const [cmd, ...params] = format_command(searcher, [dir, id])
```

There are two variables of this kind:

| Variable | Description |
|----------|-------------|
```DOWNLOAD``` | The command that downloads the YouTube video based on the specified URL and resolution. <br> For yt-dlp, the command is: ```yt-dlp -S res:$0 -P $1 "$2"``` with the first parameter being the resolution, the second parameter being the Linux-style directory to save downloaded videos, and the third parameter is the video's URL.
```Search``` | The command that searches downloaded YouTube videos on the server which contain the same ID as found in the YouTube URL.