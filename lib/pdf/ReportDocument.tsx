import React from 'react';
import { Document, Font, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

// Never hyphenate — headings like "following" must not break as "fol-lowing".
Font.registerHyphenationCallback((word) => [word]);
import { CategoryScore, ScorecardConfig, Tier } from '@/lib/types';
import { tierFor } from '@/lib/scoring';
import { stripTags } from '@/lib/richtext';

export interface ReportData {
  firstName: string;
  lastName: string;
  business: string;
  overallPercent: number;
  categoryScores: CategoryScore[];
  date: string;
}

export type PdfImages = {
  logo: Buffer | null;
  cover: Buffer | null;
  howToRead: Buffer | null;
  categories: Record<string, Buffer | null>;
  closing: Buffer | null;
};

const NAVY = '#152042';

// Paragraph arrays render as ONE flowing text block — separate <Text> elements
// per paragraph made react-pdf mis-measure heights and overlap lines.
function joinParagraphs(paragraphs: string[]): string {
  return paragraphs
    .map((p) => stripTags(p).trim())
    .filter(Boolean)
    .join('\n\n');
}

const s = StyleSheet.create({
  frame: { backgroundColor: NAVY, padding: 22 },
  sheet: { backgroundColor: '#ffffff', borderRadius: 3, padding: 40, flexGrow: 1 },
  h1: { fontSize: 25, fontFamily: 'Helvetica-Bold', color: '#0c0d0d' },
  h2: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#0c0d0d', marginBottom: 8 },
  lead: { fontSize: 12, fontFamily: 'Helvetica-Bold', lineHeight: 1.5, color: '#0c0d0d', marginBottom: 10 },
  p: { fontSize: 10.5, lineHeight: 1.55, color: '#3a3d40', marginBottom: 10 },
  footerLeft: { position: 'absolute', bottom: 16, left: 40, fontSize: 9, color: '#616366' },
  pageNo: { position: 'absolute', bottom: 16, right: 40, fontSize: 9, color: '#616366' },
});

// Circular score ring on the Transformation Keys page. The category images are
// hero photos for the category pages — never shown here, the ring always holds
// the percentage itself.
function RingScore({ percent, tier }: { percent: number; tier: Tier }) {
  return (
    <View style={{ width: 74, alignItems: 'center', flexShrink: 0 }}>
      <View
        style={{
          width: 62,
          height: 62,
          borderRadius: 31,
          borderWidth: 6,
          borderColor: tier.color,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <Text style={{ color: tier.color, fontSize: 14, fontFamily: 'Helvetica-Bold' }}>{percent}%</Text>
      </View>
    </View>
  );
}

// "13% — YOU SCORED" card overlapping the category hero image. react-pdf has
// no box-shadow, so the shadow is a soft offset layer behind a translucent
// white card; the circle and text stay fully opaque on top.
function ScoreBadge({ percent, tier }: { percent: number; tier: Tier }) {
  return (
    <View style={{ position: 'absolute', right: 30, top: 64, width: 132 }}>
      <View
        style={{
          position: 'absolute',
          top: 5,
          left: 5,
          right: -5,
          bottom: -5,
          backgroundColor: 'rgba(12, 13, 13, 0.22)',
        }}
      />
      <View
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.82)',
          padding: 12,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 66,
            height: 66,
            borderRadius: 33,
            backgroundColor: tier.color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 18, fontFamily: 'Helvetica-Bold' }}>{percent}%</Text>
        </View>
        <Text style={{ marginTop: 9, fontSize: 9, letterSpacing: 3, color: '#3a3d40' }}>YOU SCORED</Text>
      </View>
    </View>
  );
}

// Matches the reference report design: navy-framed pages, cover photo with
// name/date boxes, ring scores on the keys page, category pages with a hero
// image and score badge, and a closing page with a photo + navy panel.
export function ReportDocument({
  config,
  data,
  images,
}: {
  config: ScorecardConfig;
  data: ReportData;
  images: PdfImages;
}) {
  const pdf = config.pdf;
  const hidden = pdf.hidden ?? [];
  const footerText = stripTags(pdf.footerText || config.title);
  const panel = pdf.panel ?? { background: NAVY, buttonColor: '#1c78fe', imagePosition: 'left' as const };
  const visibleCategories = data.categoryScores.filter((c) => !hidden.includes(`cat:${c.key}`));
  let pageNo = 1;
  const nextPageNo = () => ++pageNo;

  return (
    <Document title={`${stripTags(pdf.coverTitle)} — ${data.firstName} ${data.lastName}`}>
      {/* Cover */}
      {!hidden.includes('cover') && (
        <Page size="A4" style={{ backgroundColor: NAVY, paddingTop: 34, paddingHorizontal: 56, paddingBottom: 0 }}>
          <View style={{ backgroundColor: '#ffffff', flexGrow: 1, paddingTop: 34, paddingHorizontal: 30 }}>
            <Text
              style={{
                fontSize: 27,
                fontFamily: 'Helvetica-Bold',
                color: '#0c0d0d',
                textAlign: 'center',
                marginBottom: 26,
              }}
            >
              {stripTags(pdf.coverTitle)}
            </Text>
            <View style={{ flexGrow: 1, position: 'relative' }}>
              {images.cover ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={images.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <View style={{ width: '100%', height: '100%', backgroundColor: '#eef1f7', alignItems: 'center', justifyContent: 'center' }}>
                  {images.logo && (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <Image src={images.logo} style={{ width: 180, height: 180, objectFit: 'contain' }} />
                  )}
                </View>
              )}
              <View style={{ position: 'absolute', bottom: 96, left: 0, right: 0, alignItems: 'center' }}>
                <View style={{ backgroundColor: '#ffffff', paddingVertical: 8, paddingHorizontal: 26, minWidth: 170, alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: '#3a3d40' }}>
                    {data.firstName} {data.lastName}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: '#ffffff',
                    paddingVertical: 8,
                    paddingHorizontal: 26,
                    minWidth: 170,
                    alignItems: 'center',
                    marginTop: 14,
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#3a3d40' }}>{data.date}</Text>
                </View>
              </View>
            </View>
          </View>
        </Page>
      )}

      {/* How to read */}
      {!hidden.includes('howToRead') && (
        <Page size="A4" style={s.frame}>
          <View style={s.sheet}>
            <Text style={[s.h1, { fontSize: 24 }]}>{stripTags(pdf.howToReadTitle)}</Text>
            {/* flexShrink 0 on the text + flexBasis 0 on the image: the image
                only ever fills LEFTOVER space. With an auto basis its intrinsic
                photo height overflowed the page and yoga shrank the text views,
                painting paragraphs on top of each other. */}
            <View style={{ marginTop: 18, flexShrink: 0 }}>
              {pdf.howToRead.length > 0 && (
                <Text style={s.lead}>{joinParagraphs(pdf.howToRead.slice(0, 1))}</Text>
              )}
              {pdf.howToRead.length > 1 && <Text style={s.p}>{joinParagraphs(pdf.howToRead.slice(1))}</Text>}
            </View>
            {images.howToRead && (
              <View style={{ flexGrow: 1, flexBasis: 0, minHeight: 0, marginTop: 8, marginBottom: 24 }}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={images.howToRead} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </View>
            )}
            <Text style={s.footerLeft}>{footerText}</Text>
            <Text style={s.pageNo}>{nextPageNo()}</Text>
          </View>
        </Page>
      )}

      {/* Transformation keys summary */}
      {!hidden.includes('keys') && (
        <Page size="A4" style={s.frame}>
          <View style={s.sheet}>
            <Text style={[s.h1, { fontSize: 24, marginBottom: 24, maxWidth: 420 }]}>
              {stripTags(pdf.keysHeading)}
            </Text>
            {visibleCategories.map((c) => {
              const t = tierFor(c.percent, config.tiers);
              const text = config.results.categoryTexts[c.key]?.[t.key] ?? '';
              return (
                <View key={c.key} style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
                  <RingScore percent={c.percent} tier={t} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12.5, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>{c.label}</Text>
                    <Text style={{ fontSize: 9.5, lineHeight: 1.5, color: '#3a3d40' }}>{stripTags(text)}</Text>
                  </View>
                </View>
              );
            })}
            <Text style={s.footerLeft}>{footerText}</Text>
            <Text style={s.pageNo}>{nextPageNo()}</Text>
          </View>
        </Page>
      )}

      {/* Individual category pages */}
      {visibleCategories.map((c) => {
        const t = tierFor(c.percent, config.tiers);
        const content = pdf.categories[c.key]?.[t.key] ?? pdf.categories[c.key]?.medium;
        if (!content) return null;
        const hero = images.categories[c.key];
        return (
          <Page key={c.key} size="A4" style={s.frame}>
            <View style={[s.sheet, { padding: 0 }]}>
              <View style={{ height: 132, position: 'relative' }}>
                {hero ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <Image src={hero} style={{ width: '100%', height: 132, objectFit: 'cover' }} />
                ) : (
                  <View style={{ width: '100%', height: 132, backgroundColor: NAVY, opacity: 0.92 }} />
                )}
                <ScoreBadge percent={c.percent} tier={t} />
              </View>
              <View style={{ paddingHorizontal: 40, paddingTop: 22, paddingBottom: 40 }}>
                <Text style={[s.h1, { maxWidth: 320 }]}>{c.label}</Text>
                <View style={{ marginTop: 16 }}>
                  <Text style={s.p}>{joinParagraphs(content.intro)}</Text>
                  <Text style={[s.h2, { marginTop: 6 }]}>{stripTags(content.exampleTitle)}</Text>
                  <Text style={s.p}>{joinParagraphs(content.example)}</Text>
                </View>
              </View>
              <Text style={s.pageNo}>{nextPageNo()}</Text>
            </View>
          </Page>
        );
      })}

      {/* Closing page: photo background with navy panel */}
      {!hidden.includes('closing') && (
        <Page size="A4" style={{ backgroundColor: NAVY, padding: 22 }}>
          <View style={{ flexGrow: 1, position: 'relative', backgroundColor: '#ffffff' }}>
            {/* In-flow image (like the cover page) — an absolutely-positioned
                image with percentage sizes resolves to zero height here. */}
            {images.closing && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={images.closing} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <Text style={{ position: 'absolute', top: 18, left: 20, fontSize: 10, color: images.closing ? '#ffffff' : '#0c0d0d' }}>
              {footerText}
            </Text>
            <View
              style={{
                position: 'absolute',
                bottom: 36,
                ...(panel.imagePosition === 'right' ? { right: 20 } : { left: 20 }),
                width: 330,
                backgroundColor: panel.background,
                padding: 26,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 20, fontFamily: 'Helvetica-Bold', lineHeight: 1.25 }}>
                {stripTags(pdf.closingTitle)}
              </Text>
              <View style={{ marginTop: 14 }}>
                <Text style={{ color: '#e6e9f2', fontSize: 9.5, lineHeight: 1.55 }}>
                  {joinParagraphs(pdf.closing)}
                </Text>
              </View>
            </View>
            <Text style={{ position: 'absolute', bottom: 14, right: 18, fontSize: 9, color: images.closing ? '#ffffff' : '#616366' }}>
              {nextPageNo()}
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
