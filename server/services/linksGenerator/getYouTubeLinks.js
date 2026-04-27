const { google } = require('googleapis');

exports.getYouTubeLinks = async (auth) => {
    console.log("getYouTubeVideos: working")
    try {
        const service = google.youtube('v3');
        let nextPageToken = null;
        const allVideos = [];

        do {
            const res = await service.playlistItems.list({
                playlistId: 'LL',
                part: ['snippet', 'contentDetails'],
                maxResults: 50,
                pageToken: nextPageToken || undefined,
                auth,
            });

            res.data.items.forEach(async item => {
                const name = item.snippet.title;
                const videoId = item.contentDetails.videoId;
                const url = `https://youtu.be/${videoId}`;
                allVideos.push({ name, url });
            });
            nextPageToken = res.data.nextPageToken;
            console.log(`📥 Loaded: ${allVideos.length} so far...`);

            //if(allVideos.length >= 5) break; //ссылки для первых 100 видео 

        } while (nextPageToken);
        console.log(`✅ Received ${allVideos.length} videos from YT`)
        return allVideos;
    } catch (err) {
        console.error(`Error in getYouTubeVideos : ${err}`)
        return [];
    }
};