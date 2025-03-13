
import { Verse } from "@/types/hymn";

export const processMarkdownToVerses = (
  markdown: string
): Verse[] => {
  if (!markdown) return [];

  const lines = markdown.split("\n");
  const verses = [];
  let currentVerse = "";
  let chorus = "";
  let verseNumber = 1;
  let isChorus = false;
  let hasChorus = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === "" && currentVerse !== "") {
      if (verseNumber == 2 && isChorus) {
        verseNumber++;
        verses.push({ content: chorus });
      }
      if (!isChorus && chorus !== "" && verseNumber !== 2) {
        verses.push({ number: verseNumber++, content: currentVerse.trim() });
        verses.push({ content: chorus });
      } else {
        verses.push({ number: verseNumber++, content: currentVerse.trim() });
      }
      currentVerse = "";
      isChorus = false;
    } else if (trimmedLine.startsWith("**CHORUS:**")) {
      isChorus = true;
      currentVerse += trimmedLine.replace("**CHORUS:**", "Chorus: ");
    } else if (
      !trimmedLine.startsWith("###") &&
      !trimmedLine.startsWith("**CHORUS:**") &&
      !trimmedLine.startsWith("Verse") &&
      !trimmedLine.startsWith("**") &&
      !trimmedLine.startsWith("Chorus") &&
      !/^\d+\./.test(trimmedLine) // Ignore lines starting with a number followed by a dot
    ) {
      currentVerse += trimmedLine + "\n";
      if (isChorus) {
        chorus = currentVerse.trim();
        hasChorus = true;
      }
    }
  }

  if (currentVerse !== "") {
    verses.push({ number: verseNumber, content: currentVerse.trim() });
    if (chorus !== "") {
      verses.push({ content: chorus });
    }
  }

  return verses;
};
