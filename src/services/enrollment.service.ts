import { Term } from "../types/enrollment";

export const getCurrentTerm = () => {
  const currentYear = new Date().getFullYear();

  const currentMonth = new Date().getMonth() + 1;

  let currentTerm: Term;

  if (currentMonth >= 1 && currentMonth <= 4) {
    currentTerm = "Jan";
  } else if (currentMonth >= 5 && currentMonth <= 8) {
    currentTerm = "May";
  } else {
    currentTerm = "Sept";
  }

  return { currentTerm, currentYear };
};
