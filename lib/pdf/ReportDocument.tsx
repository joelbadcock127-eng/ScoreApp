import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { CategoryScore, ScorecardConfig, Tier } from '@/lib/types';
import { tierFor } from '@/lib/scoring';

export interface ReportData {
  firstName: string;
  lastName: string;
  business: string;
  overallPercent: number;
  categoryScores: CategoryScore[];
  date: string;
}

const NAVY = '#152042';

const s = StyleSheet.create({
  frame: { backgroundColor: NAVY, padding: 22 },
  sheet: { backgroundColor: '#ffffff', borderRadius: 3, padding: 40, flexGrow: 1 },
  h1: { fontSize: 25, fontFamily: 'Helvetica-Bold', color: '#0c0d0d' },
  h2: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#0c0d0d', marginBottom: 8 },
  p: { fontSize: 10.5, lineHeight: 1.55, color: '#3a3d40', marginBottom: 10 },
  footerLeft: { position: 'absolute', bottom: 16, left: 40, fontSize: 9, color: '#616366' },
  pageNo: { position: 'absolute', bottom: 16, right: 40, fontSize: 9, color: '#616366' },
  scoreCard: {
    position: 'absolute',
    right: 40,
    top: 92,
    width: 148,
    backgroundColor: '#ffffff',
    padding: 14,
    alignItems: 'center',
    border: '1 solid #e6e6e6',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function ScoreBadge({ percent, tier }: { percent: number; tier: Tier }) {
  return (
    <View style={s.scoreCard}>
      <View
        style={[s.circle, { width: 74, height: 74, borderRadius: 37, backgroundColor: tier.color }]}
      >
        <Text style={{ color: '#ffffff', fontSize: 20, fontFamily: 'Helvetica-Bold' }}>
          {percent}%
        </Text>
      </View>
      <Text style={{ marginTop: 10, fontSize: 10, letterSpacing: 2, color: '#616366' }}>
        YOU SCORED
      </Text>
    </View>
  );
}

// Mirrors the original ScoreApp PDF: cover, how-to-read, transformation keys,
// one tier-dynamic page per category, then the personal-review closing page.
export function ReportDocument({
  config,
  data,
  logo,
}: {
  config: ScorecardConfig;
  data: ReportData;
  logo: Buffer | null;
}) {
  return (
    <Document title={`${config.pdf.coverTitle} — ${data.firstName} ${data.lastName}`}>
      {/* Page 1: Cover */}
      <Page size="A4" style={{ backgroundColor: NAVY, padding: 48 }}>
        <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          {logo && (
            <View style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginBottom: 40 }}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={logo} style={{ width: 120, height: 120, objectFit: 'contain' }} />
            </View>
          )}
          <Text style={{ color: '#ffffff', fontSize: 28, fontFamily: 'Helvetica-Bold', textAlign: 'center', maxWidth: 420 }}>
            {config.pdf.coverTitle}
          </Text>
          <Text style={{ color: '#ffffff', fontSize: 14, marginTop: 28 }}>
            {data.firstName} {data.lastName}
          </Text>
          {data.business ? (
            <Text style={{ color: '#c6cbe0', fontSize: 11, marginTop: 8 }}>{data.business}</Text>
          ) : null}
          <Text style={{ color: '#c6cbe0', fontSize: 11, marginTop: 8 }}>{data.date}</Text>
        </View>
      </Page>

      {/* Page 2: How to read */}
      <Page size="A4" style={s.frame}>
        <View style={s.sheet}>
          <Text style={[s.h1, { fontSize: 22 }]}>{config.pdf.howToReadTitle}</Text>
          <View style={{ marginTop: 20 }}>
            {config.pdf.howToRead.map((p, i) => (
              <Text key={i} style={s.p}>
                {p}
              </Text>
            ))}
          </View>
          <Text style={s.footerLeft}>{config.title}</Text>
          <Text style={s.pageNo}>2</Text>
        </View>
      </Page>

      {/* Page 3: Transformation keys summary */}
      <Page size="A4" style={s.frame}>
        <View style={s.sheet}>
          <Text style={[s.h2, { fontSize: 17, marginBottom: 18 }]}>{config.pdf.keysHeading}</Text>
          {data.categoryScores.map((c) => {
            const t = tierFor(c.percent, config.tiers);
            const text = config.results.categoryTexts[c.key]?.[t.key] ?? '';
            return (
              <View key={c.key} style={{ flexDirection: 'row', gap: 14, marginBottom: 16 }}>
                <View
                  style={[s.circle, { width: 54, height: 54, borderRadius: 27, backgroundColor: t.color, flexShrink: 0 }]}
                >
                  <Text style={{ color: '#ffffff', fontSize: 13, fontFamily: 'Helvetica-Bold' }}>
                    {c.percent}%
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12.5, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
                    {c.label}
                  </Text>
                  <Text style={{ fontSize: 9.5, lineHeight: 1.5, color: '#3a3d40' }}>{text}</Text>
                </View>
              </View>
            );
          })}
          <Text style={s.footerLeft}>{config.title}</Text>
          <Text style={s.pageNo}>3</Text>
        </View>
      </Page>

      {/* Pages 4-7: Individual category pages */}
      {data.categoryScores.map((c, idx) => {
        const t = tierFor(c.percent, config.tiers);
        const content =
          config.pdf.categories[c.key]?.[t.key] ?? config.pdf.categories[c.key]?.medium;
        if (!content) return null;
        return (
          <Page key={c.key} size="A4" style={s.frame}>
            <View style={s.sheet}>
              <View style={{ height: 88, backgroundColor: NAVY, borderRadius: 3, marginBottom: 18, opacity: 0.92 }} />
              <ScoreBadge percent={c.percent} tier={t} />
              <Text style={[s.h1, { maxWidth: 320 }]}>{c.label}</Text>
              <View style={{ marginTop: 18 }}>
                {content.intro.map((p, i) => (
                  <Text key={i} style={s.p}>
                    {p}
                  </Text>
                ))}
                <Text style={[s.h2, { marginTop: 6 }]}>{content.exampleTitle}</Text>
                {content.example.map((p, i) => (
                  <Text key={i} style={s.p}>
                    {p}
                  </Text>
                ))}
              </View>
              <Text style={s.pageNo}>{4 + idx}</Text>
            </View>
          </Page>
        );
      })}

      {/* Final page: next step */}
      <Page size="A4" style={s.frame}>
        <View style={[s.sheet, { justifyContent: 'center' }]}>
          <Text style={[s.h1, { fontSize: 22, textAlign: 'center' }]}>{config.pdf.closingTitle}</Text>
          <View style={{ marginTop: 24, alignSelf: 'center', maxWidth: 420 }}>
            {config.pdf.closing.map((p, i) => (
              <Text key={i} style={[s.p, { textAlign: 'center' }]}>
                {p}
              </Text>
            ))}
          </View>
          <Text style={s.footerLeft}>{config.title}</Text>
          <Text style={s.pageNo}>{4 + data.categoryScores.length}</Text>
        </View>
      </Page>
    </Document>
  );
}
