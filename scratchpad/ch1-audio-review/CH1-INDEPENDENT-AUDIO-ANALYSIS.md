# Chapter 1 Independent Audio Analysis

Automated independent analysis of the three committed review clips. No source audio was modified.

## Speech recognition
### CURRENT
- Transcript: In 1957, the Western world took notice when R. Gordon Wasson documented his experience in Life magazine. These traditions emphasize strict ceremonial protocols, fasting, prayer, and guidance by an elder of current era. Surr, surr, surr, giikke, zuon, zuon, surr, surr, chirr, surr, zuon, surr, chaw, fei, shay. Surr's safe passage through spiritual realms. Such practices remind us that psilocybin was regarded as a sacrament, not a casual medicine. The science behind psilocybin modern research has begun to validate many traditional claims about psilocybin's benefits. For example, missed
- Contains exact phrase “to ensure”: NO
- Duration: 43.440 s
- Median loudness: -26.55 dBFS
- Median pitch: 178.72 Hz
- Median spectral centroid: 988.4 Hz

### V1
- Transcript: In 1957, the Western world took notice when R. Gordon Wasson documented his experience in Life magazine. These traditions emphasize strict ceremonial protocols, fasting, prayer, and guidance by an elder or curandero to ensure safe passage through spiritual realms. Such practices remind us that psilocybin was regarded as a sacrament, not a casual medicine. The science behind psilocybin modern research has begun to validate many traditional claims about psilocybin's benefits. For example, mystical experiences
- Contains exact phrase “to ensure”: YES
- Duration: 43.000 s
- Median loudness: -25.61 dBFS
- Median pitch: 182.20 Hz
- Median spectral centroid: 1048.0 Hz
- Clean-material DTW cost vs CURRENT (lower is closer): 0.013609
- Boundary-match cost vs CURRENT (lower is safer for splice): 0.016670

### V2
- Transcript: In 1957, the Western world took notice when R. Gordon Wasson documented his experience in Life magazine. These traditions emphasize strict ceremonial protocols, fasting, prayer, and guidance by an elder or curandero to ensure safe passage through spiritual realms. Such practices remind us that psilocybin was regarded as a sacrament, not a casual medicine. The science behind psilocybin modern research has begun to validate many traditional claims about psilocybin's benefits. For example, mystical experiences
- Contains exact phrase “to ensure”: YES
- Duration: 43.000 s
- Median loudness: -25.85 dBFS
- Median pitch: 177.53 Hz
- Median spectral centroid: 1068.7 Hz
- Clean-material DTW cost vs CURRENT (lower is closer): 0.014181
- Boundary-match cost vs CURRENT (lower is safer for splice): 0.017212

## Recommendation
**Preferred source: V2.**
- Composite splice-risk score (lower is better): V1=0.113112; V2=0.090164.
- Use the smallest natural phrase or clause that restores “to ensure”; do not replace the entire chapter.
- Make the edit from the lossless/current source files, not from these review MP3s.
- After the splice, perform a human seam listen at headphones and speaker volume before rebuilding the full book.

## Raw measurements
```json
{
  "scores": {
    "V1": 0.1131121443109354,
    "V2": 0.09016380365427648
  },
  "results": {
    "CURRENT": {
      "transcript": "In 1957, the Western world took notice when R. Gordon Wasson documented his experience in Life magazine. These traditions emphasize strict ceremonial protocols, fasting, prayer, and guidance by an elder of current era. Surr, surr, surr, giikke, zuon, zuon, surr, surr, chirr, surr, zuon, surr, chaw, fei, shay. Surr's safe passage through spiritual realms. Such practices remind us that psilocybin was regarded as a sacrament, not a casual medicine. The science behind psilocybin modern research has begun to validate many traditional claims about psilocybin's benefits. For example, missed",
      "normalized_transcript": "in 1957 the western world took notice when r gordon wasson documented his experience in life magazine these traditions emphasize strict ceremonial protocols fasting prayer and guidance by an elder of current era surr surr surr giikke zuon zuon surr surr chirr surr zuon surr chaw fei shay surr s safe passage through spiritual realms such practices remind us that psilocybin was regarded as a sacrament not a casual medicine the science behind psilocybin modern research has begun to validate many traditional claims about psilocybin s benefits for example missed",
      "words": [
        {
          "word": "In",
          "start": 0.0,
          "end": 1.06,
          "probability": 0.09282930195331573
        },
        {
          "word": "1957,",
          "start": 1.06,
          "end": 2.08,
          "probability": 0.9324089288711548
        },
        {
          "word": "the",
          "start": 2.98,
          "end": 3.02,
          "probability": 0.92070472240448
        },
        {
          "word": "Western",
          "start": 3.02,
          "end": 3.46,
          "probability": 0.7903887033462524
        },
        {
          "word": "world",
          "start": 3.46,
          "end": 3.88,
          "probability": 0.8232377767562866
        },
        {
          "word": "took",
          "start": 3.88,
          "end": 4.16,
          "probability": 0.9931642413139343
        },
        {
          "word": "notice",
          "start": 4.16,
          "end": 4.68,
          "probability": 0.9870835542678833
        },
        {
          "word": "when",
          "start": 4.68,
          "end": 5.04,
          "probability": 0.9106719493865967
        },
        {
          "word": "R.",
          "start": 5.04,
          "end": 5.36,
          "probability": 0.9125300049781799
        },
        {
          "word": "Gordon",
          "start": 5.7,
          "end": 5.8,
          "probability": 0.9582319855690002
        },
        {
          "word": "Wasson",
          "start": 5.8,
          "end": 6.44,
          "probability": 0.6104003638029099
        },
        {
          "word": "documented",
          "start": 6.44,
          "end": 7.16,
          "probability": 0.9797828793525696
        },
        {
          "word": "his",
          "start": 7.16,
          "end": 7.58,
          "probability": 0.9965630173683167
        },
        {
          "word": "experience",
          "start": 7.58,
          "end": 8.34,
          "probability": 0.9805826544761658
        },
        {
          "word": "in",
          "start": 8.34,
          "end": 8.78,
          "probability": 0.9934005737304688
        },
        {
          "word": "Life",
          "start": 8.78,
          "end": 9.1,
          "probability": 0.8483974933624268
        },
        {
          "word": "magazine.",
          "start": 9.1,
          "end": 9.8,
          "probability": 0.681889533996582
        },
        {
          "word": "These",
          "start": 10.02,
          "end": 10.22,
          "probability": 0.9765667915344238
        },
        {
          "word": "traditions",
          "start": 10.22,
          "end": 10.84,
          "probability": 0.9876165986061096
        },
        {
          "word": "emphasize",
          "start": 10.84,
          "end": 11.8,
          "probability": 0.6741589307785034
        },
        {
          "word": "strict",
          "start": 11.8,
          "end": 12.32,
          "probability": 0.9859245419502258
        },
        {
          "word": "ceremonial",
          "start": 12.32,
          "end": 13.1,
          "probability": 0.9897350072860718
        },
        {
          "word": "protocols,",
          "start": 13.1,
          "end": 13.9,
          "probability": 0.987982988357544
        },
        {
          "word": "fasting,",
          "start": 14.28,
          "end": 14.74,
          "probability": 0.9634745717048645
        },
        {
          "word": "prayer,",
          "start": 15.08,
          "end": 15.36,
          "probability": 0.997634768486023
        },
        {
          "word": "and",
          "start": 15.7,
          "end": 15.78,
          "probability": 0.9964683055877686
        },
        {
          "word": "guidance",
          "start": 15.78,
          "end": 16.26,
          "probability": 0.9980543851852417
        },
        {
          "word": "by",
          "start": 16.26,
          "end": 16.72,
          "probability": 0.9411962032318115
        },
        {
          "word": "an",
          "start": 16.72,
          "end": 16.88,
          "probability": 0.9832279682159424
        },
        {
          "word": "elder",
          "start": 16.88,
          "end": 17.16,
          "probability": 0.8054757714271545
        },
        {
          "word": "of",
          "start": 17.16,
          "end": 17.42,
          "probability": 0.6714760661125183
        },
        {
          "word": "current",
          "start": 17.42,
          "end": 17.62,
          "probability": 0.13736848533153534
        },
        {
          "word": "era.",
          "start": 17.62,
          "end": 17.98,
          "probability": 0.83846116065979
        },
        {
          "word": "Surr,",
          "start": 17.98,
          "end": 18.84,
          "probability": 0.16358846332877874
        },
        {
          "word": "surr,",
          "start": 18.84,
          "end": 19.36,
          "probability": 0.867521196603775
        },
        {
          "word": "surr,",
          "start": 19.54,
          "end": 20.24,
          "probability": 0.9029520153999329
        },
        {
          "word": "giikke,",
          "start": 20.34,
          "end": 20.64,
          "probability": 0.35069218650460243
        },
        {
          "word": "zuon,",
          "start": 20.76,
          "end": 21.32,
          "probability": 0.1849018558859825
        },
        {
          "word": "zuon,",
          "start": 21.6,
          "end": 22.26,
          "probability": 0.72838427623113
        },
        {
          "word": "surr,",
          "start": 22.26,
          "end": 22.62,
          "probability": 0.8636382818222046
        },
        {
          "word": "surr,",
          "start": 22.62,
          "end": 22.8,
          "probability": 0.9137333035469055
        },
        {
          "word": "chirr,",
          "start": 22.9,
          "end": 23.34,
          "probability": 0.4535164212187131
        },
        {
          "word": "surr,",
          "start": 23.34,
          "end": 24.22,
          "probability": 0.8780581057071686
        },
        {
          "word": "zuon,",
          "start": 24.22,
          "end": 24.56,
          "probability": 0.6987761755784353
        },
        {
          "word": "surr,",
          "start": 24.96,
          "end": 25.22,
          "probability": 0.8786436319351196
        },
        {
          "word": "chaw,",
          "start": 25.3,
          "end": 25.46,
          "probability": 0.587744802236557
        },
        {
          "word": "fei,",
          "start": 25.62,
          "end": 25.78,
          "probability": 0.1964394524693489
        },
        {
          "word": "shay.",
          "start": 25.86,
          "end": 26.12,
          "probability": 0.6579695343971252
        },
        {
          "word": "Surr's",
          "start": 26.3,
          "end": 26.7,
          "probability": 0.9124822815259298
        },
        {
          "word": "safe",
          "start": 26.7,
          "end": 26.88,
          "probability": 0.9117082953453064
        },
        {
          "word": "passage",
          "start": 26.88,
          "end": 27.26,
          "probability": 0.959178626537323
        },
        {
          "word": "through",
          "start": 27.26,
          "end": 27.52,
          "probability": 0.984872579574585
        },
        {
          "word": "spiritual",
          "start": 27.52,
          "end": 27.9,
          "probability": 0.960141658782959
        },
        {
          "word": "realms.",
          "start": 27.9,
          "end": 28.38,
          "probability": 0.9898511171340942
        },
        {
          "word": "Such",
          "start": 28.66,
          "end": 28.76,
          "probability": 0.9956226944923401
        },
        {
          "word": "practices",
          "start": 28.76,
          "end": 29.2,
          "probability": 0.990882396697998
        },
        {
          "word": "remind",
          "start": 29.2,
          "end": 29.64,
          "probability": 0.9922187328338623
        },
        {
          "word": "us",
          "start": 29.64,
          "end": 29.9,
          "probability": 0.9973483085632324
        },
        {
          "word": "that",
          "start": 29.9,
          "end": 30.18,
          "probability": 0.9897940158843994
        },
        {
          "word": "psilocybin",
          "start": 30.18,
          "end": 30.66,
          "probability": 0.8805665075778961
        },
        {
          "word": "was",
          "start": 30.66,
          "end": 30.82,
          "probability": 0.9944823980331421
        },
        {
          "word": "regarded",
          "start": 30.82,
          "end": 31.16,
          "probability": 0.997191846370697
        },
        {
          "word": "as",
          "start": 31.16,
          "end": 31.42,
          "probability": 0.9969731569290161
        },
        {
          "word": "a",
          "start": 31.42,
          "end": 31.52,
          "probability": 0.9666128158569336
        },
        {
          "word": "sacrament,",
          "start": 31.52,
          "end": 31.9,
          "probability": 0.9899033308029175
        },
        {
          "word": "not",
          "start": 32.1,
          "end": 32.24,
          "probability": 0.997948944568634
        },
        {
          "word": "a",
          "start": 32.24,
          "end": 32.36,
          "probability": 0.9617393612861633
        },
        {
          "word": "casual",
          "start": 32.36,
          "end": 32.7,
          "probability": 0.9738069772720337
        },
        {
          "word": "medicine.",
          "start": 32.7,
          "end": 33.1,
          "probability": 0.9971632361412048
        },
        {
          "word": "The",
          "start": 33.3,
          "end": 33.42,
          "probability": 0.9922598004341125
        },
        {
          "word": "science",
          "start": 33.42,
          "end": 33.68,
          "probability": 0.9958590865135193
        },
        {
          "word": "behind",
          "start": 33.68,
          "end": 34.04,
          "probability": 0.9975563287734985
        },
        {
          "word": "psilocybin",
          "start": 34.04,
          "end": 34.68,
          "probability": 0.9942277073860168
        },
        {
          "word": "modern",
          "start": 34.68,
          "end": 34.94,
          "probability": 0.9413395524024963
        },
        {
          "word": "research",
          "start": 34.94,
          "end": 35.4,
          "probability": 0.9954450130462646
        },
        {
          "word": "has",
          "start": 35.4,
          "end": 35.56,
          "probability": 0.9945279955863953
        },
        {
          "word": "begun",
          "start": 35.56,
          "end": 35.8,
          "probability": 0.991228461265564
        },
        {
          "word": "to",
          "start": 35.8,
          "end": 35.94,
          "probability": 0.9983678460121155
        },
        {
          "word": "validate",
          "start": 35.94,
          "end": 36.32,
          "probability": 0.9963642954826355
        },
        {
          "word": "many",
          "start": 36.32,
          "end": 36.88,
          "probability": 0.997275173664093
        },
        {
          "word": "traditional",
          "start": 36.88,
          "end": 37.74,
          "probability": 0.9572737216949463
        },
        {
          "word": "claims",
          "start": 37.74,
          "end": 38.72,
          "probability": 0.9862776398658752
        },
        {
          "word": "about",
          "start": 38.72,
          "end": 39.52,
          "probability": 0.9927922487258911
        },
        {
          "word": "psilocybin's",
          "start": 39.52,
          "end": 41.18,
          "probability": 0.978168499469757
        },
        {
          "word": "benefits.",
          "start": 41.18,
          "end": 41.76,
          "probability": 0.988283634185791
        },
        {
          "word": "For",
          "start": 41.76,
          "end": 42.28,
          "probability": 0.7156739830970764
        },
        {
          "word": "example,",
          "start": 42.28,
          "end": 42.8,
          "probability": 0.9942278861999512
        },
        {
          "word": "missed",
          "start": 43.26,
          "end": 43.28,
          "probability": 0.07504713535308838
        }
      ],
      "duration": 43.44,
      "wer_like": 0.8111111111111111,
      "rms_db_median": -26.54595947265625,
      "rms_db_p95": -18.077608108520508,
      "spectral_centroid_median_hz": 988.369070597023,
      "zcr_median": 0.07177734375,
      "f0_median_hz": 178.71929907408497,
      "f0_iqr_hz": 36.70305152002905,
      "phrase_hits": [
        {
          "word": "to",
          "start": 35.8,
          "end": 35.94,
          "probability": 0.9983678460121155
        }
      ]
    },
    "V2": {
      "transcript": "In 1957, the Western world took notice when R. Gordon Wasson documented his experience in Life magazine. These traditions emphasize strict ceremonial protocols, fasting, prayer, and guidance by an elder or curandero to ensure safe passage through spiritual realms. Such practices remind us that psilocybin was regarded as a sacrament, not a casual medicine. The science behind psilocybin modern research has begun to validate many traditional claims about psilocybin's benefits. For example, mystical experiences",
      "normalized_transcript": "in 1957 the western world took notice when r gordon wasson documented his experience in life magazine these traditions emphasize strict ceremonial protocols fasting prayer and guidance by an elder or curandero to ensure safe passage through spiritual realms such practices remind us that psilocybin was regarded as a sacrament not a casual medicine the science behind psilocybin modern research has begun to validate many traditional claims about psilocybin s benefits for example mystical experiences",
      "words": [
        {
          "word": "In",
          "start": 0.0,
          "end": 0.4,
          "probability": 0.8993129730224609
        },
        {
          "word": "1957,",
          "start": 0.4,
          "end": 1.34,
          "probability": 0.992480993270874
        },
        {
          "word": "the",
          "start": 2.12,
          "end": 2.16,
          "probability": 0.8912815451622009
        },
        {
          "word": "Western",
          "start": 2.16,
          "end": 2.64,
          "probability": 0.8846887350082397
        },
        {
          "word": "world",
          "start": 2.64,
          "end": 2.94,
          "probability": 0.7836920022964478
        },
        {
          "word": "took",
          "start": 2.94,
          "end": 3.28,
          "probability": 0.9990249872207642
        },
        {
          "word": "notice",
          "start": 3.28,
          "end": 3.78,
          "probability": 0.9954869151115417
        },
        {
          "word": "when",
          "start": 3.78,
          "end": 4.2,
          "probability": 0.9831143617630005
        },
        {
          "word": "R.",
          "start": 4.2,
          "end": 4.64,
          "probability": 0.9598537087440491
        },
        {
          "word": "Gordon",
          "start": 4.94,
          "end": 5.14,
          "probability": 0.9862542152404785
        },
        {
          "word": "Wasson",
          "start": 5.14,
          "end": 5.86,
          "probability": 0.5976884886622429
        },
        {
          "word": "documented",
          "start": 5.86,
          "end": 6.7,
          "probability": 0.9674828052520752
        },
        {
          "word": "his",
          "start": 6.7,
          "end": 7.16,
          "probability": 0.9985254406929016
        },
        {
          "word": "experience",
          "start": 7.16,
          "end": 7.9,
          "probability": 0.9920656085014343
        },
        {
          "word": "in",
          "start": 7.9,
          "end": 8.42,
          "probability": 0.997526228427887
        },
        {
          "word": "Life",
          "start": 8.42,
          "end": 8.72,
          "probability": 0.8739464282989502
        },
        {
          "word": "magazine.",
          "start": 8.72,
          "end": 9.48,
          "probability": 0.64159095287323
        },
        {
          "word": "These",
          "start": 9.82,
          "end": 10.1,
          "probability": 0.9839417338371277
        },
        {
          "word": "traditions",
          "start": 10.1,
          "end": 10.78,
          "probability": 0.9925029277801514
        },
        {
          "word": "emphasize",
          "start": 10.78,
          "end": 11.72,
          "probability": 0.7811185121536255
        },
        {
          "word": "strict",
          "start": 11.72,
          "end": 12.34,
          "probability": 0.9952269792556763
        },
        {
          "word": "ceremonial",
          "start": 12.34,
          "end": 13.14,
          "probability": 0.9953965544700623
        },
        {
          "word": "protocols,",
          "start": 13.14,
          "end": 13.94,
          "probability": 0.9949119687080383
        },
        {
          "word": "fasting,",
          "start": 14.36,
          "end": 14.92,
          "probability": 0.9819440841674805
        },
        {
          "word": "prayer,",
          "start": 15.2,
          "end": 15.52,
          "probability": 0.9985190033912659
        },
        {
          "word": "and",
          "start": 15.9,
          "end": 16.02,
          "probability": 0.9987099170684814
        },
        {
          "word": "guidance",
          "start": 16.02,
          "end": 16.48,
          "probability": 0.9983755350112915
        },
        {
          "word": "by",
          "start": 16.48,
          "end": 16.92,
          "probability": 0.9697543382644653
        },
        {
          "word": "an",
          "start": 16.92,
          "end": 17.1,
          "probability": 0.997232973575592
        },
        {
          "word": "elder",
          "start": 17.1,
          "end": 17.46,
          "probability": 0.8479482531547546
        },
        {
          "word": "or",
          "start": 17.46,
          "end": 18.0,
          "probability": 0.9628192782402039
        },
        {
          "word": "curandero",
          "start": 18.0,
          "end": 18.98,
          "probability": 0.775650680065155
        },
        {
          "word": "to",
          "start": 18.98,
          "end": 19.3,
          "probability": 0.7769991755485535
        },
        {
          "word": "ensure",
          "start": 19.3,
          "end": 19.86,
          "probability": 0.9930511713027954
        },
        {
          "word": "safe",
          "start": 19.86,
          "end": 20.36,
          "probability": 0.9846712350845337
        },
        {
          "word": "passage",
          "start": 20.36,
          "end": 21.06,
          "probability": 0.9985211491584778
        },
        {
          "word": "through",
          "start": 21.06,
          "end": 21.56,
          "probability": 0.9953972697257996
        },
        {
          "word": "spiritual",
          "start": 21.56,
          "end": 22.26,
          "probability": 0.9936093091964722
        },
        {
          "word": "realms.",
          "start": 22.26,
          "end": 22.84,
          "probability": 0.954884946346283
        },
        {
          "word": "Such",
          "start": 22.84,
          "end": 23.28,
          "probability": 0.8007959127426147
        },
        {
          "word": "practices",
          "start": 23.28,
          "end": 23.94,
          "probability": 0.9962950348854065
        },
        {
          "word": "remind",
          "start": 23.94,
          "end": 24.78,
          "probability": 0.9919412136077881
        },
        {
          "word": "us",
          "start": 24.78,
          "end": 25.3,
          "probability": 0.9980792999267578
        },
        {
          "word": "that",
          "start": 25.3,
          "end": 25.84,
          "probability": 0.9894408583641052
        },
        {
          "word": "psilocybin",
          "start": 25.84,
          "end": 26.5,
          "probability": 0.9920278340578079
        },
        {
          "word": "was",
          "start": 26.5,
          "end": 26.76,
          "probability": 0.9968769550323486
        },
        {
          "word": "regarded",
          "start": 26.76,
          "end": 27.24,
          "probability": 0.9987598657608032
        },
        {
          "word": "as",
          "start": 27.24,
          "end": 27.88,
          "probability": 0.9978760480880737
        },
        {
          "word": "a",
          "start": 27.88,
          "end": 28.16,
          "probability": 0.9766408801078796
        },
        {
          "word": "sacrament,",
          "start": 28.16,
          "end": 28.82,
          "probability": 0.9713341593742371
        },
        {
          "word": "not",
          "start": 29.16,
          "end": 29.36,
          "probability": 0.9986799359321594
        },
        {
          "word": "a",
          "start": 29.36,
          "end": 29.58,
          "probability": 0.9955614805221558
        },
        {
          "word": "casual",
          "start": 29.58,
          "end": 30.04,
          "probability": 0.9771391749382019
        },
        {
          "word": "medicine.",
          "start": 30.04,
          "end": 30.7,
          "probability": 0.9947879314422607
        },
        {
          "word": "The",
          "start": 31.06,
          "end": 31.16,
          "probability": 0.9733132123947144
        },
        {
          "word": "science",
          "start": 31.16,
          "end": 31.52,
          "probability": 0.9941726326942444
        },
        {
          "word": "behind",
          "start": 31.52,
          "end": 32.02,
          "probability": 0.9987678527832031
        },
        {
          "word": "psilocybin",
          "start": 32.02,
          "end": 32.98,
          "probability": 0.998634546995163
        },
        {
          "word": "modern",
          "start": 32.98,
          "end": 33.4,
          "probability": 0.4569428563117981
        },
        {
          "word": "research",
          "start": 33.4,
          "end": 34.06,
          "probability": 0.9989047050476074
        },
        {
          "word": "has",
          "start": 34.06,
          "end": 34.5,
          "probability": 0.9964616894721985
        },
        {
          "word": "begun",
          "start": 34.5,
          "end": 34.94,
          "probability": 0.9941750168800354
        },
        {
          "word": "to",
          "start": 34.94,
          "end": 35.18,
          "probability": 0.9989768266677856
        },
        {
          "word": "validate",
          "start": 35.18,
          "end": 35.76,
          "probability": 0.9970968961715698
        },
        {
          "word": "many",
          "start": 35.76,
          "end": 36.3,
          "probability": 0.9980447292327881
        },
        {
          "word": "traditional",
          "start": 36.3,
          "end": 36.96,
          "probability": 0.9948305487632751
        },
        {
          "word": "claims",
          "start": 36.96,
          "end": 37.6,
          "probability": 0.9983810186386108
        },
        {
          "word": "about",
          "start": 37.6,
          "end": 38.12,
          "probability": 0.9981688261032104
        },
        {
          "word": "psilocybin's",
          "start": 38.12,
          "end": 39.16,
          "probability": 0.986148190498352
        },
        {
          "word": "benefits.",
          "start": 39.16,
          "end": 39.66,
          "probability": 0.9939863681793213
        },
        {
          "word": "For",
          "start": 40.08,
          "end": 40.22,
          "probability": 0.9787478446960449
        },
        {
          "word": "example,",
          "start": 40.22,
          "end": 40.76,
          "probability": 0.9984867572784424
        },
        {
          "word": "mystical",
          "start": 41.28,
          "end": 41.62,
          "probability": 0.9776975512504578
        },
        {
          "word": "experiences",
          "start": 41.62,
          "end": 42.56,
          "probability": 0.9939057230949402
        }
      ],
      "duration": 43.0,
      "wer_like": 0.72,
      "rms_db_median": -25.848102569580078,
      "rms_db_p95": -18.321508407592773,
      "spectral_centroid_median_hz": 1068.7002136476972,
      "zcr_median": 0.074951171875,
      "f0_median_hz": 177.5280123319498,
      "f0_iqr_hz": 30.666696886724424,
      "phrase_hits": [
        {
          "word": "to",
          "start": 18.98,
          "end": 19.3,
          "probability": 0.7769991755485535
        },
        {
          "word": "ensure",
          "start": 19.3,
          "end": 19.86,
          "probability": 0.9930511713027954
        },
        {
          "word": "to",
          "start": 34.94,
          "end": 35.18,
          "probability": 0.9989768266677856
        }
      ],
      "dtw_clean_current_cost": 0.014181146159499577,
      "boundary_match_cost": 0.017212063135884588
    },
    "V1": {
      "transcript": "In 1957, the Western world took notice when R. Gordon Wasson documented his experience in Life magazine. These traditions emphasize strict ceremonial protocols, fasting, prayer, and guidance by an elder or curandero to ensure safe passage through spiritual realms. Such practices remind us that psilocybin was regarded as a sacrament, not a casual medicine. The science behind psilocybin modern research has begun to validate many traditional claims about psilocybin's benefits. For example, mystical experiences",
      "normalized_transcript": "in 1957 the western world took notice when r gordon wasson documented his experience in life magazine these traditions emphasize strict ceremonial protocols fasting prayer and guidance by an elder or curandero to ensure safe passage through spiritual realms such practices remind us that psilocybin was regarded as a sacrament not a casual medicine the science behind psilocybin modern research has begun to validate many traditional claims about psilocybin s benefits for example mystical experiences",
      "words": [
        {
          "word": "In",
          "start": 0.0,
          "end": 0.8,
          "probability": 0.460993230342865
        },
        {
          "word": "1957,",
          "start": 0.8,
          "end": 1.86,
          "probability": 0.9817976951599121
        },
        {
          "word": "the",
          "start": 2.44,
          "end": 2.54,
          "probability": 0.9478556513786316
        },
        {
          "word": "Western",
          "start": 2.54,
          "end": 2.96,
          "probability": 0.8364720940589905
        },
        {
          "word": "world",
          "start": 2.96,
          "end": 3.36,
          "probability": 0.8220312595367432
        },
        {
          "word": "took",
          "start": 3.36,
          "end": 3.74,
          "probability": 0.9983807802200317
        },
        {
          "word": "notice",
          "start": 3.74,
          "end": 4.3,
          "probability": 0.9941099286079407
        },
        {
          "word": "when",
          "start": 4.3,
          "end": 4.68,
          "probability": 0.979119598865509
        },
        {
          "word": "R.",
          "start": 4.68,
          "end": 4.96,
          "probability": 0.8885932564735413
        },
        {
          "word": "Gordon",
          "start": 5.26,
          "end": 5.38,
          "probability": 0.9831650257110596
        },
        {
          "word": "Wasson",
          "start": 5.38,
          "end": 6.02,
          "probability": 0.5862977355718613
        },
        {
          "word": "documented",
          "start": 6.02,
          "end": 6.82,
          "probability": 0.9855837821960449
        },
        {
          "word": "his",
          "start": 6.82,
          "end": 7.2,
          "probability": 0.9985426664352417
        },
        {
          "word": "experience",
          "start": 7.2,
          "end": 7.8,
          "probability": 0.9886753559112549
        },
        {
          "word": "in",
          "start": 7.8,
          "end": 8.44,
          "probability": 0.9972895383834839
        },
        {
          "word": "Life",
          "start": 8.44,
          "end": 8.78,
          "probability": 0.8365790843963623
        },
        {
          "word": "magazine.",
          "start": 8.78,
          "end": 9.28,
          "probability": 0.6643749475479126
        },
        {
          "word": "These",
          "start": 9.9,
          "end": 10.1,
          "probability": 0.9831796884536743
        },
        {
          "word": "traditions",
          "start": 10.1,
          "end": 10.78,
          "probability": 0.990828275680542
        },
        {
          "word": "emphasize",
          "start": 10.78,
          "end": 11.76,
          "probability": 0.7970137596130371
        },
        {
          "word": "strict",
          "start": 11.76,
          "end": 12.34,
          "probability": 0.9955825209617615
        },
        {
          "word": "ceremonial",
          "start": 12.34,
          "end": 13.14,
          "probability": 0.9959245920181274
        },
        {
          "word": "protocols,",
          "start": 13.14,
          "end": 13.88,
          "probability": 0.9942453503608704
        },
        {
          "word": "fasting,",
          "start": 14.38,
          "end": 14.92,
          "probability": 0.9806967377662659
        },
        {
          "word": "prayer,",
          "start": 15.22,
          "end": 15.5,
          "probability": 0.9981751441955566
        },
        {
          "word": "and",
          "start": 15.86,
          "end": 15.98,
          "probability": 0.9977668523788452
        },
        {
          "word": "guidance",
          "start": 15.98,
          "end": 16.46,
          "probability": 0.9976485371589661
        },
        {
          "word": "by",
          "start": 16.46,
          "end": 16.88,
          "probability": 0.9810280203819275
        },
        {
          "word": "an",
          "start": 16.88,
          "end": 17.1,
          "probability": 0.9967852830886841
        },
        {
          "word": "elder",
          "start": 17.1,
          "end": 17.42,
          "probability": 0.8263474106788635
        },
        {
          "word": "or",
          "start": 17.42,
          "end": 17.9,
          "probability": 0.9600999355316162
        },
        {
          "word": "curandero",
          "start": 17.9,
          "end": 18.4,
          "probability": 0.6319534281889597
        },
        {
          "word": "to",
          "start": 18.78,
          "end": 19.08,
          "probability": 0.8314453959465027
        },
        {
          "word": "ensure",
          "start": 19.08,
          "end": 19.66,
          "probability": 0.9899571537971497
        },
        {
          "word": "safe",
          "start": 19.66,
          "end": 20.16,
          "probability": 0.980928361415863
        },
        {
          "word": "passage",
          "start": 20.16,
          "end": 20.82,
          "probability": 0.9978193044662476
        },
        {
          "word": "through",
          "start": 20.82,
          "end": 21.38,
          "probability": 0.9961018562316895
        },
        {
          "word": "spiritual",
          "start": 21.38,
          "end": 22.04,
          "probability": 0.9928448796272278
        },
        {
          "word": "realms.",
          "start": 22.04,
          "end": 22.64,
          "probability": 0.993533730506897
        },
        {
          "word": "Such",
          "start": 22.64,
          "end": 23.14,
          "probability": 0.7362721562385559
        },
        {
          "word": "practices",
          "start": 23.14,
          "end": 23.7,
          "probability": 0.9948624968528748
        },
        {
          "word": "remind",
          "start": 23.7,
          "end": 24.62,
          "probability": 0.9952422380447388
        },
        {
          "word": "us",
          "start": 24.62,
          "end": 25.2,
          "probability": 0.9977582097053528
        },
        {
          "word": "that",
          "start": 25.2,
          "end": 25.82,
          "probability": 0.9931930899620056
        },
        {
          "word": "psilocybin",
          "start": 25.82,
          "end": 26.84,
          "probability": 0.9736378043889999
        },
        {
          "word": "was",
          "start": 26.84,
          "end": 27.22,
          "probability": 0.9964010715484619
        },
        {
          "word": "regarded",
          "start": 27.22,
          "end": 27.7,
          "probability": 0.9984191656112671
        },
        {
          "word": "as",
          "start": 27.7,
          "end": 28.3,
          "probability": 0.9975636005401611
        },
        {
          "word": "a",
          "start": 28.3,
          "end": 28.5,
          "probability": 0.9937520623207092
        },
        {
          "word": "sacrament,",
          "start": 28.5,
          "end": 29.06,
          "probability": 0.9891703724861145
        },
        {
          "word": "not",
          "start": 29.36,
          "end": 29.7,
          "probability": 0.9969924688339233
        },
        {
          "word": "a",
          "start": 29.7,
          "end": 30.0,
          "probability": 0.9897035956382751
        },
        {
          "word": "casual",
          "start": 30.0,
          "end": 30.5,
          "probability": 0.951289176940918
        },
        {
          "word": "medicine.",
          "start": 30.5,
          "end": 31.04,
          "probability": 0.9985349178314209
        },
        {
          "word": "The",
          "start": 31.38,
          "end": 31.48,
          "probability": 0.9868329167366028
        },
        {
          "word": "science",
          "start": 31.48,
          "end": 31.94,
          "probability": 0.996832549571991
        },
        {
          "word": "behind",
          "start": 31.94,
          "end": 32.4,
          "probability": 0.998471200466156
        },
        {
          "word": "psilocybin",
          "start": 32.4,
          "end": 33.34,
          "probability": 0.997561439871788
        },
        {
          "word": "modern",
          "start": 33.34,
          "end": 33.76,
          "probability": 0.6912913918495178
        },
        {
          "word": "research",
          "start": 33.76,
          "end": 34.42,
          "probability": 0.9988000392913818
        },
        {
          "word": "has",
          "start": 34.42,
          "end": 34.86,
          "probability": 0.9953332543373108
        },
        {
          "word": "begun",
          "start": 34.86,
          "end": 35.3,
          "probability": 0.9955667853355408
        },
        {
          "word": "to",
          "start": 35.3,
          "end": 35.54,
          "probability": 0.9991514682769775
        },
        {
          "word": "validate",
          "start": 35.54,
          "end": 36.08,
          "probability": 0.99610435962677
        },
        {
          "word": "many",
          "start": 36.08,
          "end": 36.62,
          "probability": 0.9984630346298218
        },
        {
          "word": "traditional",
          "start": 36.62,
          "end": 37.26,
          "probability": 0.9932600855827332
        },
        {
          "word": "claims",
          "start": 37.26,
          "end": 37.82,
          "probability": 0.9987395405769348
        },
        {
          "word": "about",
          "start": 37.82,
          "end": 38.28,
          "probability": 0.9980462789535522
        },
        {
          "word": "psilocybin's",
          "start": 38.28,
          "end": 39.3,
          "probability": 0.9780308246612549
        },
        {
          "word": "benefits.",
          "start": 39.3,
          "end": 39.7,
          "probability": 0.9906050562858582
        },
        {
          "word": "For",
          "start": 40.02,
          "end": 40.18,
          "probability": 0.9800722599029541
        },
        {
          "word": "example,",
          "start": 40.18,
          "end": 40.62,
          "probability": 0.9987242817878723
        },
        {
          "word": "mystical",
          "start": 41.22,
          "end": 41.54,
          "probability": 0.9646819233894348
        },
        {
          "word": "experiences",
          "start": 41.54,
          "end": 42.48,
          "probability": 0.9935291409492493
        }
      ],
      "duration": 43.0,
      "wer_like": 0.72,
      "rms_db_median": -25.612369537353516,
      "rms_db_p95": -17.78693962097168,
      "spectral_centroid_median_hz": 1048.0220455363087,
      "zcr_median": 0.0712890625,
      "f0_median_hz": 182.20140516722486,
      "f0_iqr_hz": 32.83864627609992,
      "phrase_hits": [
        {
          "word": "to",
          "start": 18.78,
          "end": 19.08,
          "probability": 0.8314453959465027
        },
        {
          "word": "ensure",
          "start": 19.08,
          "end": 19.66,
          "probability": 0.9899571537971497
        },
        {
          "word": "to",
          "start": 35.3,
          "end": 35.54,
          "probability": 0.9991514682769775
        }
      ],
      "dtw_clean_current_cost": 0.013609188975955677,
      "boundary_match_cost": 0.016669899188283634
    }
  }
}
```