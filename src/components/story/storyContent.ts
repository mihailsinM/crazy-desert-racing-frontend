export type StorySlide = {
  title?: string;
  copy: string;
  finale?: boolean;
};

export const storySlides: StorySlide[] = [
  {
    title: "Why Crazy Desert Racing?",
    copy: "Crazy Desert Racing started as a dream inspired by the landscapes of the Negev Desert.",
  },
  {
    title: "A Dream With a Future",
    copy: "The goal is to create a future community around adventure, racing, friendship, festivals, and unforgettable experiences under the open sky.",
  },
  {
    title: "More Than Racing",
    copy: "Crazy Desert Live Club is more than racing, cars, or festivals.",
  },
  {
    title: "A Place for All of Us",
    copy: "It is a place for people brought together by the desert, the open road, freedom, and the desire to create real memories.",
  },
  {
    title: "Different Passions. One Club.",
    copy: "Some come for speed. Some for music and nights under the open sky. Others love travel, camping, photography, or unusual cars.",
  },
  {
    title: "Crazy Desert Club Members",
    copy: "We are different, but all of us are part of one shared idea. We are Crazy Desert Club Members.",
  },
  {
    title: "Stories Become Memories",
    copy: "Every road becomes a story. Every meeting becomes a memory. Every event leaves more than photos — it leaves the feeling: “I was there. I was part of it.”",
  },
  {
    title: "Drive. Explore. Belong.",
    copy: "Not just a place to visit. A place to belong.",
  },
  {
    copy: "Today, it is a project. Tomorrow... reality.",
    finale: true,
  },
];

const minimumStoryDurationMs = 4_000;
const referenceCharacterCount = 35;

export function getStoryDuration(slide: StorySlide) {
  const proportionalDuration = Math.round(
    (slide.copy.length * minimumStoryDurationMs) / referenceCharacterCount,
  );

  return Math.max(minimumStoryDurationMs, proportionalDuration);
}
