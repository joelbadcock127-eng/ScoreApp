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
  frame: { backgroundColor: NAVY, padding: 24 },
  sheet: { backgroundColor: '#ffffff', borderRadius: 4, padding: 36, flexGrow: 1 },
  h1: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: '#0c0d0d' },
  h2: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#0c0d0d', marginBottom: 8 },
  p: { fontSize: 10.5, lineHeight: 1.55, color: '#3a3d40', marginBottom: 10 },
  pageNo: { position: 'absolute', bottom: 14, right: 24, fontSize: 9, color: '#616366' },
  scoreCard: {
    position: 'absolute',
    right: 36,
    top: 96,
    width: 150,
    backgroundColor: '#ffffff',
    padding: 14,
    alignItems: 'center',
    border: '1 solid #e6e6e6',
  },
  circle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function ScoreBadge({ percent, tier }: { percent: number; tier: Tier }) {
  return (
    <View style={s.scoreCard}>
      <View style={[s.circle, { backgroundColor: tier.color, border: `3 solid ${tier.color}` }]}>
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

export function ReportDocument({
  config,
  data,
  logo,
}: {
  config: ScorecardConfig;
  data: ReportData;
  logo: Buffer | null;
}) {
  const overallTier = tierFor(data.overallPercent, config.tiers);
  const intro = config.results.tierIntros[overallTier.key] ?? config.results.tierIntros.medium;

  return (
    <Document title={`${config.pdf.coverTitle} — ${data.firstName} ${data.lastName}`}>
      {/* Cover */}
      <Page size="A4" style={{ backgroundColor: NAVY, padding: 48 }}>
        <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          {logo && (
            <View style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginBottom: 36 }}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={logo} style={{ width: 130, height: 130, objectFit: 'contain' }} />
            </View>
          )}
          <Text style={{ color: '#ffffff', fontSize: 30, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>
            {config.pdf.coverTitle}
          </Text>
          <Text style={{ color: '#c6cbe0', fontSize: 12, marginTop: 14, textAlign: 'center', maxWidth: 380, lineHeight: 1.5 }}>
            {config.pdf.coverSubtitle}
          </Text>
          <View style={{ marginTop: 44, alignItems: 'center' }}>
            <Text style={{ color: '#ffffff', fontSize: 13 }}>
              Prepared for {data.firstName} {data.lastName}
            </Text>
            {data.business ? (
              <Text style={{ color: '#c6cbe0', fontSize: 11, marginTop: 6 }}>{data.business}</Text>
            ) : null}
            <Text style={{ color: '#c6cbe0', fontSize: 10, marginTop: 6 }}>{data.date}</Text>
          </View>
          <View
            style={{
              marginTop: 44,
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: overallTier.color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 28, fontFamily: 'Helvetica-Bold' }}>
              {data.overallPercent}%
            </Text>
          </View>
          <Text style={{ color: '#ffffff', fontSize: 11, marginTop: 10, letterSpacing: 2 }}>
            YOUR OVERALL SCORE
          </Text>
        </View>
      </Page>

      {/* Overall result */}
      <Page size="A4" style={s.frame}>
        <View style={s.sheet}>
          <Text style={{ fontSize: 13, color: '#616366' }}>Thank you for taking the</Text>
          <Text style={[s.h1, { marginTop: 4 }]}>{config.title}</Text>
          <View
            style={{
              marginTop: 24,
              padding: 16,
              backgroundColor: '#f6f7fb',
              borderRadius: 6,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <View style={[s.circle, { width: 64, height: 64, borderRadius: 32, backgroundColor: overallTier.color }]}>
              <Text style={{ color: '#ffffff', fontSize: 17, fontFamily: 'Helvetica-Bold' }}>
                {data.overallPercent}%
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
                {config.results.overallHeading}: {overallTier.label}
              </Text>
              <Text style={{ fontSize: 10, color: '#616366' }}>
                Scored against the {config.categories.length} key areas of your business.
              </Text>
            </View>
          </View>
          <Text style={[s.h2, { marginTop: 26 }]}>{intro.headline}</Text>
          {intro.body.map((p, i) => (
            <Text key={i} style={s.p}>
              {p}
            </Text>
          ))}
          <Text style={s.pageNo}>2</Text>
        </View>
      </Page>

      {/* Transformation keys summary */}
      <Page size="A4" style={s.frame}>
        <View style={s.sheet}>
          <Text style={[s.h2, { fontSize: 18, marginBottom: 18 }]}>{config.pdf.keysHeading}</Text>
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
          <Text style={s.pageNo}>3</Text>
        </View>
      </Page>

      {/* Individual category pages */}
      {data.categoryScores.map((c, idx) => {
        const t = tierFor(c.percent, config.tiers);
        const content =
          config.pdf.categories[c.key]?.[t.key] ?? config.pdf.categories[c.key]?.medium;
        if (!content) return null;
        return (
          <Page key={c.key} size="A4" style={s.frame}>
            <View style={s.sheet}>
              <View
                style={{ height: 90, backgroundColor: NAVY, borderRadius: 4, marginBottom: 18, opacity: 0.9 }}
              />
              <ScoreBadge percent={c.percent} tier={t} />
              <Text style={[s.h1, { maxWidth: 330 }]}>{c.label}</Text>
              <View style={{ marginTop: 20 }}>
                {content.intro.map((p, i) => (
                  <Text key={i} style={s.p}>
                    {p}
                  </Text>
                ))}
                <Text style={[s.h2, { marginTop: 8 }]}>{content.exampleTitle}</Text>
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

      {/* Closing page */}
      <Page size="A4" style={{ backgroundColor: NAVY, padding: 48 }}>
        <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#ffffff', fontSize: 22, fontFamily: 'Helvetica-Bold', textAlign: 'center', maxWidth: 400 }}>
            Ready to unlock your AI opportunity?
          </Text>
          <Text style={{ color: '#c6cbe0', fontSize: 11.5, marginTop: 16, textAlign: 'center', maxWidth: 380, lineHeight: 1.6 }}>
            {config.results.cta.rightBody}
          </Text>
          <Text style={{ color: '#ffffff', fontSize: 10, marginTop: 40 }}>{config.copyright} Acceso AI</Text>
        </View>
      </Page>
    </Document>
  );
}
