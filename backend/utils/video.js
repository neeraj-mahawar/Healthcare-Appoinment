// utils/video.js
import pkg from "agora-access-token";
import dotenv from "dotenv";
dotenv.config();

const { RtcTokenBuilder, RtcRole } = pkg;

/**
 * Generate Agora RTC token for a given channel
 * @param {string} channelName - Unique channel name
 * @param {number} uid - User ID (default 0)
 * @param {number} expireInSeconds - Token expiration time in seconds (default 3600s)
 * @returns {string} - Agora RTC Token
 */
export const generateVideoToken = (channelName, uid = 0, expireInSeconds = 3600) => {
  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appID || !appCertificate) {
    throw new Error(
      "❌ Agora APP_ID or APP_CERTIFICATE is missing. Please check your .env file."
    );
  }

  const role = RtcRole.PUBLISHER;
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireInSeconds;

  return RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );
};
