# Evidence - appears-rankings, part 2: topic SERPs and the competition set (lens rank-)

- Lens: DO PEOPLE FIND IT WHEN THEY SEARCH (ids `rank-`), part 2. Main file: `docs/operations/evidence/2026-09-24/appears-rankings.md` (summary, findings, works, unverified, brand + book SERPs, method notes).
- Site: https://www.mayaallan.com
- UTC window of observations in this part: 2026-09-24T18:20:49Z - 2026-09-24T18:28:07Z
- Sources (all live, anonymous, US English):
  - **B1** = Bing, `curl GET https://www.bing.com/search?q=<query>&setlang=en-US&cc=US`, Chrome UA, 18:20:49Z-18:20:54Z. Page 1 only (Bing ignored `first=11`; see main file, method notes).
  - **B2** = Bing second observation, same URL + `&form=QBLH`, Safari UA, 18:24:22Z-18:24:30Z.
  - **WS** = Claude Code WebSearch tool (engine not disclosed, US-only), top 9 per query. Batches: T1-T3 18:22:03Z-18:22:16Z, T4-T6 18:22:16Z-18:22:26Z, T7-T9 18:22:26Z-18:22:36Z, T10 18:22:36Z-18:22:52Z.
  - **WS-site** = WebSearch restricted with `allowed_domains=["mayaallan.com"]`, 18:24:32Z-18:25:25Z.
  - **Live page** = `curl GET https://www.mayaallan.com/<path>` (HTTP status, title, meta robots, canonical), 18:26:10Z-18:26:26Z.
- "MA" = position of any mayaallan.com / psilowire.com / psilocybinintegrationguide.com URL. "decoy" = Bing answered with an off-topic set built from one word of the query (bot-degraded response). A decoy row proves nothing.
- This file was never written locally. Each section was built in memory and saved through the GitHub git-data API. Later sections were appended to the live file fetched from the branch at push time.

## Summary - topic queries

| # | Query | MA Bing B1 | MA Bing B2 | MA WS top 9 | Absence evidence | Her closest live page (GET 18:26Z; all HTTP 200, index,follow, self-canonical) |
|---|---|---|---|---|---|---|
| T1 | psilocybin integration | none (7 results) | none (7) | none | 3 observations, confirmed | /blog/psilocybin-integration-research |
| T2 | how to integrate a psilocybin experience | none (7) | none (7) | none | 3 obs, confirmed | no page titled "how to integrate" |
| T3 | psilocybin integration journal | none (7) | none (7) | none | 3 obs, confirmed | /integration-journal |
| T4 | nervous system reset after psychedelic | none (7) | none (7) | none | 3 obs, confirmed | /nervous-system-reset |
| T5 | belief inquiry | none (7) | none (7) | none | 3 obs, confirmed | /belief-inquiry |
| T6 | ego dissolution integration | none (7) | none (7) | none | 3 obs, confirmed | /scenarios/ego-dissolution |
| T7 | psilocybin integration workbook | none (7) | none (7) | none | 3 obs, confirmed | /books/psilocybin-integration-guide, /integration-journal |
| T8 | integration reflection questions psychedelic | none (7) | none (7) | none | 3 obs, confirmed | /integration-reflection |
| T9 | psychedelic integration book | decoy | decoy (variant "...books") | none | WS only: single observation, absence UNVERIFIED | /books/psilocybin-integration-guide |
| T10 | what to do after a mushroom trip | decoy | decoy (variant "after a mushroom trip integration") | none | WS only: single observation, absence UNVERIFIED | none |

WS-site (restricted to mayaallan.com) returned only `/` and `/about` for every query tried: "psilocybin integration" -> /about, /; "integration reflection questions psychedelic journal" -> /, /about; "nervous system reset after psychedelic" -> / only (filter leaked other domains); "belief inquiry" -> no mayaallan.com URL; "Maya Allan blog practices books psilocybin integration guide" -> /, /about. The topic pages are not returned by this index for any query.

## Raw SERPs per topic

### T1 psilocybin integration
- B1 18:20:49Z (7): 1 beckleyretreats.com/blog/psilocybin-and-integration-why-what-happens-after-matters-more | 2 entheotraining.com/blog/f/how-to-guide-integration-after-a-psilocybin-session | 3 odysseypbc.com/blog-posts/psychedelic-integration-after-psilocybin-journeys | 4 sciencedirect.com/science/article/pii/S258953702500450X | 5 maps.org/integration-station/ | 6 adaa.org/learn-from-us/from-the-experts/blog-posts/consumer-professional/your-psychedelic-therapy-journey | 7 oneretreatsjamaica.com/blog/your-90-day-psilocybin-integration-roadmap/ . Bing modules: People also ask.
- B2 18:24:22Z (7): top 3 identical (beckleyretreats, entheotraining, odysseypbc); MA none.
- WS (9): 1 pmc.ncbi.nlm.nih.gov/articles/PMC12495261/ | 2 adaa.org (Integration 101) | 3 nature.com/articles/s41591-022-01744-z | 4 sciencedirect.com/science/article/pii/S2950484826000238 | 5 oregon.gov/oha/PH/PREVENTIONWELLNESS/Documents/OPAB Training SC Panel_Integration Therapist Answers.pdf | 6 frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.824077/full | 7 behrpsychology.com/psychedelic-integration/ | 8 innershift.institute/psilocybin-integration/ | 9 shroombros.co/psilocybin-integration-guide-first-72-hours/

### T2 how to integrate a psilocybin experience
- B1 18:20:50Z (7): 1 entheotraining.com/blog/f/how-to-guide-integration-after-a-psilocybin-session | 2 oneretreatsjamaica.com/blog/how-to-integrate-your-psilocybin-retreat-experience-at-ho... | 3 oneretreatsjamaica.com/blog/your-90-day-psilocybin-integration-roadmap/ | 4 odysseypbc.com/blog-posts/psychedelic-integration-after-psilocybin-journeys | 5 psychologytoday.com/us/blog/truth-medicine/202604/the-art-of-integration-after-a-psyc... | 6 prismbend.com/articles/maximizing-the-magic-with-psilocybin-integration | 7 learnshrooms.com/news/integration-guide-after-psilocybin-2026/
- B2 18:24:23Z (7): top 3 entheotraining, oneretreatsjamaica x2; MA none.
- WS (9): 1 paloaltou.edu/resources/business-of-practice-blog/psilocybin-therapy-guide | 2 beckleyretreats.com/blog/psilocybin-and-integration-... | 3 adaa.org | 4 oregon.gov OPAB PDF | 5 paththerapy.ca/blog/psychedelic-integration-how-to-navigate-the-aftereffects-of-a-psilocybin-journey | 6 dazeddigital.com/life-culture/article/61720/1/... | 7 changainstitute.com/blog/integrating-psilocybin-experiences-best-practices-... | 8 spectrumpsychwa.com/wp-content/uploads/2025/04/MAPS-Integration-Workbook.pdf | 9 reflectivehealing.com/blog/.../the-art-of-integration

### T3 psilocybin integration journal
- B1 18:20:50Z (7): 1 sciencedirect.com/science/article/pii/S258953702500450X | 2 sciencedirect.com/science/article/pii/S0165032725013941 | 3 nature.com/articles/s41591-022-01744-z | 4 thelancet.com/pdfs/journals/eclinm/PIIS2589-5370(25)00450-X.pdf | 5 frontiersin.org/.../fpsyt.2026.1895181/pdf | 6 frontiersin.org/.../fpsyt.2026.1895181/full | 7 mdpi.com/1424-8247/18/4/555 . Bing reads "journal" as an academic journal.
- B2 18:24:24Z (7): top 3 sciencedirect x2, nature; MA none.
- WS (9): 1 amazon.com/Psilocybin-Integration-Journal-Pre-Ceremony-Post-Journey/dp/B0DMJZKCNC (Vaillant) | 2 amazon.com/Microdosing-Psilocybin-Integration-Journal-Experiences/dp/B0C1J3N2GX (Morgan) | 3 amazon.com/Psilocybin-Journey-preparation-integration-psychedelic/dp/B0CJDJ67ZJ (Soulsprout) | 4 akjournals.com/view/journals/2054/9/2/article-p136.xml | 5 frontiersin.org (fpsyg.2022.824077) | 6 nature.com (s41591-022-01744-z) | 7 truenorth-psychology.com/post/psychedelic-integration-tools-and-techniques | 8 frtc.ltd/blog/journaling-psychedelic-integration | 9 pivotpsychedelics.com/learn/psychedelic-integration-journaling-prompts

### T4 nervous system reset after psychedelic
- B1 18:20:51Z (7): 1 psychedelicwellnesshub.com/nervous-system-regulation-psychedelic-session/ | 2 nih.gov/news-events/nih-research-matters/how-psychedelic-drugs-alter-brain | 3 unlimitedsciences.org/rewiring-your-brain-after-psychedelics/ | 4 sciencealert.com/psychedelics-may-reset-brain-cells-in-mood-and-immune-disorders | 5 pmc.ncbi.nlm.nih.gov/articles/PMC11657683/ | 6 thethirdwave.co/psychedelics-dysregulated-nervous-system/ | 7 nature.com/articles/d41586-026-02377-9
- B2 18:24:25Z (7): top 3 psychedelicwellnesshub, nih.gov, unlimitedsciences; MA none.
- WS (9): 1 brainfacts.org/.../psychedelics-can-reopen-periods-of-heightened-brain-plasticity--051524 | 2 unlimitedsciences.org/rewiring-your-brain-after-psychedelics/ | 3 sciencedaily.com/releases/2017/10/171013091018.htm | 4 nature.com/articles/d41586-024-02275-y | 5 academic.oup.com/book/39459/chapter/339232218 | 6 youtube.com/watch?v=P7OfYY4Xgoc (guided "Nervous System Reset" breathwork video) | 7-9 biorxiv.org preprints (3)

### T5 belief inquiry
- B1 18:20:51Z (7): 1 jfriedmanphilo.github.io/IB.pdf | 2 jstor.org/stable/pdf/48555886.pdf | 3 onlinelibrary.wiley.com/doi/full/10.1111/nous.12222 | 4 people.brandeis.edu/~teuber/Clifford_ethics.pdf | 5 researchgate.net/publication/319308127_Inquiry_and_Belief | 6-7 studocu.com philosophy course notes (2)
- B2 18:24:26Z (7): top 3 identical; MA none.
- WS (9): researchgate.net (Inquiry and Belief) | cdr.lib.unc.edu (Believing as Closing Inquiry) | philpapers.org/rec/FRIIAB-2 | onlinelibrary.wiley.com (Nous) | philolibrary.crc.nd.edu (Peirce) | arxiv.org/pdf/2507.04594 | tandfonline.com (Psychological Inquiry) | jfriedmanphilo.github.io/IB.pdf | numberanalytics.com blog

### T6 ego dissolution integration
- B1 18:20:52Z (7): 1 healingdose.com/blog/integration/ego-dissolution-what-it-means-and-how-people-integra... | 2 psychedelicsphere.com/ego-death-stages-neurochemistry-integration-safety/ | 3 mindandbodyexercises.wordpress.com/2025/10/22/dissolving-of-the-ego/ | 4 gialioi.com/blog/... | 5 psychiatryinstitute.com/blog-psychedelics-ego-dissolution/ | 6 soulseekerspath.com/what-is-ego-dissolution/ | 7 writingthroughthesoul.org/2025/06/07/why-its-important-to-integrate-the-ego-...
- B2 18:24:26Z (7): top 3 identical; MA none.
- WS (9): 1 psychiatryinstitute.com/blog-psychedelics-ego-dissolution/ (bylined Kurlander MA LPC, Van Derveer MD) | 2 psychedelic.support/resources/ego-dissolution-during-psychedelic-experiences/ | 3 ncbi.nlm.nih.gov/pmc/articles/PMC12375664/ | 4 arxiv.org/pdf/1605.07153 | 5 sciencedirect.com (ego dissolution scale) | 6 saraouimette.com/blog/2025/2/25/the-dark-side-of-ego-death-... | 7 mindandbodyexercises.wordpress.com | 8 opustreatment.com/blog/ego-death-meaning-... | 9 visaliarecoverycenter.com/ego-death-...

### T7 psilocybin integration workbook
- B1 18:20:52Z (7): 1 bluesoulspace.com/product/psilocybin-integration-workbook/ | 2 spectrumpsychwa.com/wp-content/uploads/2025/04/MAPS-Integration-Workbook.pdf | 3 ingmargorman.com/workbook | 4 psybear.co/guides/psychedelic-integration-workbook | 5 amazon.com/THRIVE-Psychedelic-Integration-Workbook-Psilocybin/dp/B0DP4K6755 | 6 beingtruetoyou.com/wp-content/uploads/2024/05/Psychedelic-Prep-Packet-2024.pdf | 7 etsy.com/listing/1875472274/psychedelic-integration-workbook-pdf
- B2 18:24:27Z (7): top 3 identical; MA none.
- WS (9): 1 amazon B0DMJZKCNC (Vaillant journal) | 2 amazon.com/Psilocybin-Healing-Journey-Workbook-Preparation/dp/B0H5FN6M2M (Jussila) | 3 amazon.com/Psychedelic-Integration-Workbook-Vol-Discovery/dp/B0F1Y9CW6Q (Lepisto) | 4 truenorth-psychology.com | 5 maps.org/integration-station/ | 6 psybear.co/guides/psychedelic-integration-workbook | 7 amazon.com/Psychedelic-Therapy-Workbook-Integrating-Psychedelics/dp/1648484255 (Nielson & Gorman) | 8 gscottgraham.com/book/psychedelic-integration-workbook | 9 josephdana.substack.com

### T8 integration reflection questions psychedelic
- B1 18:20:53Z (7): 1 gaiacounselling.com/best-questions-for-psychedelic-integration/ ("15 Best Questions") | 2 blog.mylifenote.ai/psychedelic-integration-journaling/ ("50 Prompts") | 3 ketaminetherapyformentalhealth.com/wp-content/uploads/2023/03/Integration-Guide.pdf | 4 thebuenavida.net/psychedelic-integration-journaling-prompts/ ("25 Prompts") | 5 pivotpsychedelics.com/learn/psychedelic-integration-journaling-prompts | 6 spectrumpsychwa.com MAPS-Integration-Workbook.pdf | 7 beautifulspace.org/blog/how-to-journal-for-psychedelic-integration
- B2 18:24:28Z (7): top 3 identical; MA none.
- WS (9): 1 psychologytoday.com/sg/blog/between-insight-and-instinct/202607/... | 2 unlimitedsciences.org/4-methods-of-psychedelic-integration/ | 3 frontiersin.org (fpsyg.2022.824077) | 4 psychedelic.support/resources/are-psychedelics-for-me-20-self-reflection-questions/ | 5 pratigroup.org/... | 6 truenorth-psychology.com | 7 gaiacounselling.com | 8 pivotpsychedelics.com | 9 spectrumpsychwa.com MAPS PDF