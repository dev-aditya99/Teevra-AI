// Initialize the Speech Recognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition(); recognition.lang = 'en-UK';

// Start the speech recognition
export default async function startConverting() {
    await recognition.start();

    let text = "empty"

    await SpeechToText().then((res) => {
        return text = res;
    }).catch((err) => {
        console.log(err);
        throw new Error(err)
    })
    return text;

}


async function SpeechToText() {
    let text = null;
    // Display the result
    return new Promise((resolve, reject) => {
        recognition.onresult = async (event) => {
            const current = await event.resultIndex;
            const transcript = await event.results[current][0].transcript;
            text = transcript;

            if (text) {
                resolve(text);
            } else {
                reject("Unable to convert!")
            }

        };
    })
}