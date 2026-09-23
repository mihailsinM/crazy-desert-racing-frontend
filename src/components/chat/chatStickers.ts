import smile from "../../assets/chat-stickers/smile.png";
import laugh from "../../assets/chat-stickers/laugh.png";
import wink from "../../assets/chat-stickers/wink.png";
import love from "../../assets/chat-stickers/love.png";
import sad from "../../assets/chat-stickers/sad.png";
import angry from "../../assets/chat-stickers/angry.png";
import surprised from "../../assets/chat-stickers/surprised.png";
import cool from "../../assets/chat-stickers/cool.png";
import thinking from "../../assets/chat-stickers/thinking.png";
import sleepy from "../../assets/chat-stickers/sleepy.png";
import campfire from "../../assets/chat-stickers/campfire.png";
import helmet from "../../assets/chat-stickers/helmet.png";
import trophy from "../../assets/chat-stickers/trophy.png";
import wrench from "../../assets/chat-stickers/wrench.png";
import tent from "../../assets/chat-stickers/tent.png";
import cactus from "../../assets/chat-stickers/cactus.png";
import flag from "../../assets/chat-stickers/flag.png";
import buggy from "../../assets/chat-stickers/buggy.png";
import sunset from "../../assets/chat-stickers/sunset.png";
import road from "../../assets/chat-stickers/road.png";

export type ChatSticker = { name: string; image: string; filename: string };

export const chatStickers: readonly ChatSticker[] = [
  { name: "Smile", image: smile, filename: "smile" },
  { name: "Laugh", image: laugh, filename: "laugh" },
  { name: "Wink", image: wink, filename: "wink" },
  { name: "Love", image: love, filename: "love" },
  { name: "Sad", image: sad, filename: "sad" },
  { name: "Angry", image: angry, filename: "angry" },
  { name: "Surprised", image: surprised, filename: "surprised" },
  { name: "Cool", image: cool, filename: "cool" },
  { name: "Thinking", image: thinking, filename: "thinking" },
  { name: "Sleepy", image: sleepy, filename: "sleepy" },
  { name: "Campfire", image: campfire, filename: "campfire" },
  { name: "Helmet", image: helmet, filename: "helmet" },
  { name: "Trophy", image: trophy, filename: "trophy" },
  { name: "Wrench", image: wrench, filename: "wrench" },
  { name: "Tent", image: tent, filename: "tent" },
  { name: "Cactus", image: cactus, filename: "cactus" },
  { name: "Flag", image: flag, filename: "flag" },
  { name: "Buggy", image: buggy, filename: "buggy" },
  { name: "Sunset", image: sunset, filename: "sunset" },
  { name: "Road", image: road, filename: "road" },
];
