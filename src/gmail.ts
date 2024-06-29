import { google, gmail_v1 } from 'googleapis';
import * as dotenv from 'dotenv';
import { encode } from 'js-base64';
dotenv.config();

// Log to verify environment variables
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET);
console.log('Refresh Token:', process.env.GOOGLE_REFRESH_TOKEN);

const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

async function getTopEmails() {
  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 1,  // Fetch the top 5 messages
      q: '',
    });

    console.log(res.data);

    if (res.data.messages && res.data.messages.length) {
      for (const message of res.data.messages) {
        const messageId = message.id as string;
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: messageId,
          format: 'full',
        });

        const messageData: gmail_v1.Schema$Message = msg.data;

        if (messageData) {
          const headers = messageData.payload?.headers;
          const subject = headers?.find(header => header.name === 'Subject')?.value;
          const from = headers?.find(header => header.name === 'From')?.value;
          const snippet = messageData.snippet;
          const bodyData = messageData.payload?.parts?.find(part => part.mimeType === 'text/plain')?.body?.data;
          const body = bodyData ? Buffer.from(bodyData, 'base64').toString('utf-8') : '';

          console.log(`From: ${from}`);
          console.log(`Subject: ${subject}`);
          console.log(`Snippet: ${snippet}`);
          console.log(`Body: ${body}`);
          console.log('---------------------------------');

          const replySubject =` Re: ${subject}`;
            const replyBody = `Thank you for your email.\n\nBest regards,\nYour Name`;
            const replyTo = from?.match(/<(.*)>/)?.[1] || from;  // Extract email address

            const rawMessage = [
            `From: me`,
            `To: ${replyTo}`,
            `Subject: ${replySubject}`,
            `In-Reply-To: ${messageId}`,
            `References: ${messageId}`,
            '',
            replyBody,
            ].join('\n');

            const encodedMessage = encode(rawMessage);

            await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
                threadId: messageData.threadId,
            },
            });

            console.log('Reply sent successfully.');
        }
      }
    } else {
      console.log('No messages found.');
    }
  } catch (err) {
    console.error('Error retrieving emails:', err);
  }
}

getTopEmails();