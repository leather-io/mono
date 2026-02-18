import { defineQuery } from 'groq';

export const roadmapYearsQuery = defineQuery(`*[
  _type == "roadmapYear"] | order(year desc){ year, objectives, projects }
`);
