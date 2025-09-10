// ./structure/index.ts
import { HelpCircleIcon } from '@sanity/icons';
import type { StructureResolver } from 'sanity/structure';

export function structure(S: Parameters<StructureResolver>[0]) {
  return S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Legacy Help Center')
        .icon(HelpCircleIcon)
        .child(
          S.list()
            .title('Legacy Help Center Documents')
            .items([
              S.documentTypeListItem('legacyHelpCenterPage').title('Help Center Page'),
              S.documentTypeListItem('legacyHelpCenterCategory').title('Categories'),
            ])
        ),
      S.divider(),
      S.listItem()
        .title('FAQ Content')
        .child(
          S.list()
            .title('FAQ Documents')
            .items([
              S.documentTypeListItem('faqSection').title('FAQ Sections'),
              S.documentTypeListItem('faq').title('FAQs'),
            ])
        ),
      S.divider(),
      S.listItem()
        .title('Posts (Legacy)')
        .child(
          S.list()
            .title('Posts')
            .items([
              S.documentTypeListItem('post')
                .id('all-posts')
                .title('All Posts')
                .child(
                  S.documentList()
                    .title('All Posts')
                    .filter('_type == "post"')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              S.documentTypeListItem('post')
                .id('all-explainers')
                .title('Explainers')
                .child(
                  S.documentList()
                    .title('All Explainers')
                    .filter('_type == "post" && category == "Explainers"')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              S.documentTypeListItem('post')
                .id('all-guides')
                .title('Guides')
                .child(
                  S.documentList()
                    .title('All Guides')
                    .filter('_type == "post" && category == "Guides"')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              S.documentTypeListItem('post')
                .id('all-leather-lounge')
                .title('Leather Lounge')
                .child(
                  S.documentList()
                    .title('All Leather Lounge')
                    .filter('_type == "post" && category == "Leather Lounge"')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
            ])
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        listItem =>
          ![
            'legacyHelpCenterCategory',
            'legacyHelpCenterPage',
            'faqSection',
            'faq',
            'post',
          ].includes(listItem.getId() || '')
      ),
    ]);
}
