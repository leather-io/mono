import { defineField, defineType } from 'sanity';

const roadmapProjectType = defineType({
  name: 'roadmapProject',
  title: 'Roadmap Project',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Complete', value: 'complete' },
          { title: 'In Progress', value: 'in-progress' },
          { title: 'Planning', value: 'planning' },
          { title: 'Planned', value: 'planned' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
    },
    prepare({ title, status }) {
      return { title, subtitle: status };
    },
  },
});

export const roadmapYearType = defineType({
  name: 'roadmapYear',
  title: 'Roadmap Year',
  type: 'document',
  fields: [
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'objectives',
      title: 'Objectives',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      of: [{ type: 'roadmapProject' }],
    }),
  ],
  orderings: [
    {
      title: 'Year Descending',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      year: 'year',
      projects: 'projects',
    },
    prepare({ year, projects }) {
      return {
        title: String(year),
        subtitle: `${projects?.length ?? 0} projects`,
      };
    },
  },
});

export const roadmapSchemaTypes = [roadmapProjectType, roadmapYearType];
