import { BscSubjects } from "../types/course";

export const BSC_SUBJECTS: BscSubjects[] = [
  {
    name: "AI",
    description:
      "We look at how an intelligent agent solves new problems. Starting with blind search we quickly move on to heuristic search, and look at several variations designed to combat the combinatorial explosion that search has to face. We study how board games like Chess and Go are played; how search facilitates logical reasoning; and approaches to domain independent planning of actions to achieve a goal. We end with looking at an alternative formulation that combines search and reasoning as constraint processing.",
    credits: 4,
    level: "bsc",
  },
  {
    name: "DL",
    description:
      "To study the basics of Neural Networks and their various variants such as the Convolutional Neural Networks and Recurrent Neural Networks, to study the different ways in which they can be used to solve problems in various domains such as Computer Vision, Speech and NLP.",
    credits: 4,
    level: "bsc",
  },
  {
    name: "SE",
    description:
      "To prepare students to develop the essential skills required to become effective software engineers by introducing them to fundamental concepts in developing software, and essential practices employed by software developers, such as requirement gathering, creating software conceptual designs, software comprehension, debugging, testing and deployment.",
    credits: 4,
    level: "bsc",
  },
  {
    name: "ST",
    description:
      "To prepare the students to understand the phases of testing based on requirements for a project, to apply the concepts taught in the course to formulate test requirements precisely, to design and execute test cases as a part of a standard software development IDE, and to apply specially designed test case design techniques for specific application domains.",
    credits: 4,
    level: "bsc",
  },
  {
    name: "SFPG",
    description:
      "To enable the student to use the creative process to identify and solve problems in an effective way, to use structured creative thinking tools to investigate a particular matter from a variety of perspectives with clarity, to communicate and share thoughts/information accurately and effectively to understand each other, to become a team player, to value other cultures, to overcome obstacles she/he may face when performing a task.",
    credits: 4,
    level: "bsc",
  },
  {
    name: "MR",
    description:
      "To provide a basic understanding of research methodology and its implementation in different business domains, to understand the role, scope, process, cost, and value of marketing research, to match research techniques to marketing problems, to analyse data and translate them into actionable findings, to enable students to do hands-on research to solve business problems.",
    credits: 4,
    level: "bsc",
  },
  {
    name: "LLM",
    description:
      "Understanding the Transformer architecture Understanding the concept of pretraining and fine-tuning language models Compare and contrast different types of tokenizers like BPE, wordpiece, sentencepiece Understanding different LLMs architectures: encoder-decoder, encoder-only, decoder-only Exploring common datasets like C4,mc4,Pile, Stack and so on Addressing the challenges of applying vanilla attention mechanisms for long range context windows. Apply different types of fine-tuning techniques to fine-tune large language models",
    credits: 4,
    level: "bsc",
    prerequisites: ["DL"],
  },
];
