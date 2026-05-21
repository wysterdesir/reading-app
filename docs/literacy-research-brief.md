# Literacy Research Brief — Reading-Practice App for a Grade 2 Trilingual Learner

**Prepared:** 2026-05-21
**Audience:** Product/engineering decisions for a teleprompter-style reading app (English native; French + Spanish L2).
**Format:** Findings + concrete design implications. Implications are the load-bearing output.

---

## Executive Summary — Top 7 Actionable Takeaways

1. **Repeated reading is the single most-evidenced fluency technique you can implement.** Effect sizes from meta-analyses are large for fluency (~0.83) and moderate for comprehension (~0.67). Implement a Read-Naturally-style "cold/practice/hot" loop: one cold timing, 3 practice re-reads, one hot timing. Cap at 3 re-reads per story before moving on (Shanahan).

2. **Treat WCPM as a *diagnostic*, not a *target*.** Use Hasbrouck-Tindal 2017 Grade 2 norms as benchmarks (50th percentile: 50 fall / 84 winter / 100 spring). But never coach the child to "read faster." Shanahan and others explicitly warn that speed-coaching produces meaningless score inflation and harms comprehension. The app's primary signal should be *accuracy + prosody*, with rate as a downstream side-effect.

3. **The 95–98% "instructional level" rule is not actually evidence-based.** Betts made the numbers up in 1946 and they were never validated. Modern research shows students learn well from harder texts *if scaffolded*. Use accuracy bands as feedback, not gates — and bias toward letting the child stay with a slightly challenging text rather than auto-dropping difficulty.

4. **Scrolling/fading text has real empirical support — but only when comprehension is monitored.** Nuerk's text-fading study showed significant sentence-fluency gains over self-paced reading in Grade 3. Critical caveat: they used a 100% accuracy threshold to prevent superficial reading. The teleprompter UX is defensible *if* the app actively checks comprehension and doesn't reward skipping.

5. **Spanish and French need different progressions.** Spanish is among the most transparent orthographies in the world; children reach decoding ceiling by end of Grade 1 (Seymour et al. 2003). French is opaque and acquisition is ~2–2.5x slower than Spanish. Don't run one universal difficulty curve — Spanish can ramp faster, French needs explicit grapheme-phoneme scaffolding tied to standard CP/CE1 progressions.

6. **Dyslexia-friendly fonts (OpenDyslexic) have no replicated benefit; cream backgrounds and sans-serif fonts have modest but reasonable support.** Use a clean sans-serif (Andika, Sassoon Primary, or system equivalents like Verdana). Default to a warm off-white background (~#FBF6E9), high but not maximum contrast. Don't ship OpenDyslexic as the default — research is at best mixed and at worst negative.

7. **Avoid leaderboards. Use process-praise, generous accuracy bands, and reading-volume goals.** Dweck's research is strong: praise effort and strategy, not ability. Self-determination theory predicts leaderboards will demotivate a child who lands near the bottom — a real risk for a 7-year-old reading her *third* language. Use streaks sparingly (they help adherence but can produce anxiety on break-day); badges should reward process (3 re-reads completed, new sound mastered), not outcomes (fastest WPM).

---

## 1. The National Reading Panel's Five Pillars

### Finding

The NICHD National Reading Panel (2000) identified five evidence-based pillars: **phonemic awareness, phonics, fluency, vocabulary, comprehension**. The Panel's strongest, most reproducible finding on *instruction* was that **guided repeated oral reading procedures** (i.e., a child reads aloud to a guide who gives feedback) produced significant gains in word recognition, fluency, *and* comprehension across grade levels and ability groups.

### Application to a reading-practice app

| Pillar | Direct fit | How an app can reinforce |
|---|---|---|
| Phonemic awareness | Weak fit — best done with audio-only manipulation (rhyming, segmenting) | Out of primary scope; could include a 1-min warm-up module |
| Phonics | Partial fit — better suited to dedicated phonics apps | Tag re-read errors by grapheme-phoneme pattern; surface "today's tricky sound" |
| **Fluency** | **Primary fit** — this is what the app does | Repeated reading with timing, WCPM tracking, prosody coaching |
| Vocabulary | Partial fit — incidental from texts | Tap-to-define on hard words; pre-teach 3-5 keywords per story (Read Naturally pattern) |
| Comprehension | Weak fit if the app focuses on reading aloud | Add 2-3 questions after each "hot" read — critical to prevent speed-only optimization |

### Design implication for the app

- **Position the app explicitly as a *fluency* tool, not a complete reading program.** Frame copy for parents: "Practice + feedback for kids already learning to read."
- **Build comprehension into every session** (even 2 multiple-choice questions after the hot timing) so the app does not implicitly teach "reading = saying words fast."

---

## 2. Repeated Reading

### Finding

Repeated reading is the most-studied fluency intervention. Therrien (2004) meta-analysis: ES = **0.83 for fluency**, **0.67 for comprehension** on practiced passages, with substantial transfer to unpracticed text. Samuels' original protocol used 50–200 word passages, re-read until a criterion speed was met.

Shanahan synthesizes the protocol crisply:
- **Three readings, then move on.**
- Use texts slightly *above* the child's independent level (he argues ~10 errors per 100 words is fine — i.e., 90% accuracy, *below* the traditional Betts cutoff).
- Re-reads can be sequential within one session, or across consecutive days — research finds both work.
- The Read Naturally protocol formalizes this: **Cold Timing → Read Along (with audio model) → Practice (self-paced re-reads) → Hot Timing → Comprehension Qs**.

### Design implication for the app

- **Default session structure:** Pre-teach 3 keywords → Cold read (timed, with highlighting feedback but no error display) → 2-3 practice reads (with audio model on first practice) → Hot read (timed) → 2 comprehension questions.
- **Cap at 3 practice reads.** Show a "Move to a new story?" prompt after that. Don't let the child grind one passage indefinitely.
- **Always show cold-vs-hot improvement** on the same passage. This is the single most motivating feedback signal repeated-reading research surfaces — the child *sees* her own growth.
- **Passage length:** 50-100 words at Grade 2, 100-150 by end of Grade 2. Critical: short enough that memory scaffolds re-reads.

---

## 3. WCPM Norms (Hasbrouck & Tindal 2017)

### Finding

Updated norms compiled from DIBELS, DIBELS Next, and easyCBM. For Grade 2:

| Percentile | Fall | Winter | Spring |
|---|---|---|---|
| 90th | 111 | 131 | 148 |
| 75th | 84 | 109 | 124 |
| **50th** | **50** | **84** | **100** |
| 25th | 36 | 59 | 72 |
| 10th | 23 | 35 | 43 |

Hasbrouck's guidance: "Students scoring 10 or more words below the 50th percentile" need intervention support.

**For French (L2):** The closest equivalent is ELFE / E.L.FE. (Cogni-Sciences). French CE1 (≈ end of Grade 1, comparable age) average ~62 mots/min; CE2 (~end of Grade 2) average ~85 mots/min. The French Ministry of Education sets 70 mots/min as the *end of CE1* target. These are **native-French benchmarks**, not L2.

**For Spanish (L2):** No widely-used WCPM norm I could find for L2 children at age 7-8. Spanish's transparent orthography means once decoding is in place, fluency tracks closely to listening rate. A reasonable working target is 60-90 PPM (palabras por minuto) by end of Grade 2 for an L2 learner with strong oral Spanish.

**For L2 generally:** Use CEFR landmarks loosely — A1 ≈ a 6-year-old native, A2 ≈ an 8-year-old native, but those describe communicative competence, not fluency rate. Expect L2 WCPM to lag native-equivalent by ~30-50%.

### Design implication for the app

- **Show WCPM to parents, not the child.** A 7-year-old does not need a number on her screen.
- **Use the 50th percentile as the parent-visible benchmark, with explicit language-specific bands:**
  - English: full Hasbrouck-Tindal table.
  - French: ELFE/Ministry of Education progression (50 → 70 → 85+).
  - Spanish: working band 60-90 PPM for end of Grade 2; flag as estimated, not normed.
- **Never set a "WPM goal" the child has to hit.** Set a "read this passage well 3 times" goal instead. (See Topic 10.)
- **Compute a "personal best" trend** across same/similar passages — that's the motivating metric.

---

## 4. Accuracy Threshold for Instructional Level

### Finding

The "95-98% accuracy = instructional level" rule comes from Emmett Betts' 1946 textbook. **It was never empirically validated.** Shanahan documents this: "Betts just made up the numbers and teachers and professors have rapturously clung to them ever since."

Modern research finds:
- No difference between students taught at "instructional level" vs. grade-level texts.
- Sometimes *worse* outcomes for instructional-level placement (limited exposure to harder linguistic features).
- Shanahan recommends starting with texts *the child can't yet read well* and teaching her to read them well — i.e., level-matching as an *outcome*, not an *input*.

### Design implication for the app

- **Don't auto-drop difficulty when accuracy hits 90%.** That's the Betts trap.
- **Use a wider, more permissive band:**
  - <80% accuracy on a cold read → suggest the audio-model pass before practice (extra scaffolding, *not* an easier text).
  - 80-95% → standard repeated-reading flow (this is the sweet spot per Shanahan).
  - >95% sustained across hot reads → offer to advance difficulty (but never force).
- **Flag "this is hard" with empathic copy, not auto-demotion.** E.g., "This is a stretch story — let's listen to it once first."
- **Distinguish decoding errors from L2 pronunciation slips.** A French native English speaker will mispronounce English /th/ regardless of decoding skill. Same for English-native French/Spanish learners. Build a per-language phoneme map so the recognizer is forgiving of predictable L1→L2 substitutions.

---

## 5. Optimal Text Presentation for Fluency

### Finding

- **Line length:** For novice readers, 34-60 characters per line, optimum ~45 CPL (Bernard & colleagues; literature review).
- **Font:** No strong evidence that "dyslexia-friendly" fonts like OpenDyslexic improve performance. Multiple studies show OpenDyslexic *reduces* reading speed and accuracy vs. Arial/Times. Sassoon Primary and Andika are designed for early readers (consistent letterforms, infant-style 'a' and 'g') and have legitimate use, but the effect size over a clean standard sans-serif is small.
- **Serif vs sans-serif:** Modest evidence favoring sans-serif at digital sizes for children, but well-set serif works fine. Letter recognition is what matters.
- **Spacing:** Larger leading (line-height ~1.5-1.8) and slightly wider letter-spacing measurably help struggling readers and don't hurt typical readers.
- **Scrolling/teleprompter:** Nuerk et al. (2014, PMC4322541) — a 3-week text-fading intervention with Grade 3 German children produced **significantly larger sentence-reading-fluency gains than self-paced reading** (p = 0.007). Critical implementation detail: they enforced a **100% correct comprehension threshold** to prevent superficial reading. This is the closest direct evidence the teleprompter approach is defensible.
- **General digital fluency tech:** A 2024 MDPI scoping review concluded digital fluency tools help students with reading difficulties, but quality of monitoring matters more than the specific UI metaphor.

### Design implication for the app

- **Default to 45-55 CPL** at the child's reading distance. Reflow on resize.
- **Font: Andika (free, SIL) or system sans-serif at 24-32pt.** Make font + size user-configurable. Don't ship OpenDyslexic as default; offer it as an opt-in alternative with an honest "evidence is mixed" note.
- **Line-height 1.6, generous letter-spacing (~0.02em).**
- **Scroll speed = current cold WCPM × 0.9** initially. Let the child override. Show 2-3 lines at a time, not a single line — peripheral text helps prosody.
- **Calibrate fade/scroll to child's measured speed, not a fixed rate.** Nuerk's study individually calibrated; that's likely the key.
- **Always pair scroll-mode with comprehension questions.** Without that, the speed bias kicks in.
- **Offer a static "tap to advance" mode as an alternative.** Some children get anxious with auto-scroll; choice supports autonomy (SDT).

---

## 6. Color Schemes

### Finding

- **Cream/off-white backgrounds (~#FBF6E9, #FFF8E7)** are widely recommended for dyslexia and visual stress, with rationale being reduced contrast glare. Evidence is moderate but not airtight.
- **Pure-white #FFFFFF with pure-black text** has the highest contrast but causes visual fatigue and apparent "swimming" of text for some readers.
- **Irlen-style colored overlays:** A 2016 systematic review in *Ophthalmic and Physiological Optics* (Griffiths et al.) and a Cochrane-style review found **no reliable evidence** that colored overlays improve reading. The "63% of children prefer overlays" claim comes from non-blinded self-report. Lower-bias studies find no effect.
- **Some peer-reviewed work suggests turquoise or yellow tints help dyslexic readers**, but findings are not consistent.
- **Low-blue-light / "night mode" themes** have some support for evening reading and sleep hygiene, but no direct reading-performance evidence at this age.

### Design implication for the app

- **Default theme: warm off-white background (#FBF6E9) with near-black text (#1A1A1A).** Not pure white, not pure black.
- **Offer 3-4 named themes only** (Cream / Soft Blue / Night / High Contrast) — too many choices add cognitive load.
- **Don't bake in Irlen-style colored overlays as a "dyslexia setting."** It's not supported and could mislead parents.
- **Add an optional sepia mode for sustained reading.** Make it the recommendation for >15-minute sessions.

---

## 7. Multilingual / L2 Reading Acquisition

### Finding

- **Cross-linguistic transfer is real and strong.** Phonological awareness in L1 predicts decoding in L2 (multiple studies, Spanish↔English best documented). For a child who can already decode in English, that skill *transfers* — she's not starting from scratch in French and Spanish.
- **Orthographic transparency varies enormously** (Seymour, Aro, & Erskine 2003 — 14 European languages, end of Grade 1):
  - **Spanish, Finnish, Italian, German, Greek:** near-ceiling word reading accuracy by end of Grade 1.
  - **French, Portuguese, Danish:** ~80% accuracy.
  - **English:** ~34% accuracy. English acquisition is **~2.5x slower** than transparent orthographies.
- **Implication:** A 7-year-old who's solid in English decoding is *over-prepared* for Spanish phonics — Spanish has a near-one-to-one grapheme-phoneme correspondence (~30 graphemes for ~24 phonemes). French is opaque (silent letters, multi-letter graphemes like *eau, oin, ill*, liaison rules) and requires explicit instruction.
- **Cummins' linguistic interdependence:** Cognitive Academic Language Proficiency (CALP) is shared across languages — vocabulary knowledge, comprehension strategies, metalinguistic awareness all transfer. BICS (conversational fluency) is language-specific.
- **French phonics progressions** (French Ministry of Education / Eduscol): start from grapheme, move to phoneme. Standard CP sequence introduces simple graphemes (a, i, o, u, l, r, m, s, p, t, n) before complex (ou, on, an, ch, ph, oin, ail, eau, etc.). CE1 consolidates and extends.

### Design implication for the app

- **Run three separate difficulty trees,** not one.
  - English: standard Grade 2 progression (Hasbrouck-Tindal-aligned).
  - Spanish: faster ramp; once basic syllable patterns (CV, CVC) are in place, rate-of-progression can match a Spanish-monolingual Grade 1-2 child.
  - French: explicit grapheme sequencing tied to French CP/CE1 progression. **Expect ~2x slower progression than Spanish.** Show graphème-of-the-week.
- **Cross-language transfer feature:** When introducing a new English sight word that's a cognate in French/Spanish ("animal", "important"), surface it as a transfer opportunity. Cognate awareness boosts vocabulary across the three languages.
- **Separate accuracy baselines per language.** A child can be 95% accurate in English and 70% in French — don't average them.
- **Build in language-specific error tolerance.** Spanish 'r' rolling, French nasal vowels, French liaison — recognizer must be tuned per language with kid-L2 voice models. Off-the-shelf Web Speech API may be too strict.
- **Recommend a French-first practice cadence early on** because the orthography needs more reps before automaticity kicks in.

---

## 8. Motivation & Engagement

### Finding

- **Reading volume is the biggest motivator and predictor of growth.** Allington: children need **~90 minutes of actual reading per school day** (not worksheets, not listening to others read) to grow as readers. Struggling readers typically get far less.
- **Praise effort and process, not ability** (Dweck and 30 years of follow-up): "You worked hard on that tricky word" not "You're so smart." Process-praise predicts growth mindset 5 years later.
- **Self-Determination Theory** (Ryan & Deci): intrinsic motivation depends on **autonomy, competence, relatedness**. Effective gamification supports these; counterproductive gamification (heavy extrinsic rewards, leaderboards, controlling pressure) undermines them.
- **Overjustification effect:** introducing extrinsic rewards for an already-enjoyed activity can shift the child's internal narrative from "I read because I love it" to "I read for the badge." Once the badge stops mattering, intrinsic motivation has been damaged.
- **Streaks (à la Duolingo):** powerful for adherence but produce anxiety on break days and can lead to "do the minimum to keep the streak" behavior. Mixed evidence; effective when paired with grace tokens and de-emphasized in copy.
- **Leaderboards:** SDT predicts and research confirms — bottom-position learners are demotivated; embarrassment and anxiety are common. For a 7-year-old reading her third language, this is high-risk.

### Design implication for the app

- **Optimize for minutes-read, not levels-completed.** A simple daily/weekly minute counter (visible to parent, optional to child) aligns with Allington's volume principle.
- **No leaderboards. Period.** Not even friendly ones. The downside risk is real and the upside is replaceable.
- **Praise effort and strategy in voice/text feedback.** "You re-read that tricky word — that's how good readers do it." Avoid "Wow, you're so fast!"
- **Streaks: yes, but with two grace tokens per week.** A 7-year-old has sick days, busy days, sleepovers. Don't punish.
- **Badges should reward process:** "3 re-reads completed", "Tried a stretch story", "Mastered the 'oin' sound", "Read in all three languages this week." Avoid "Fastest WPM" or "Top reader" badges.
- **Give the child autonomy choices:** which language today? Which story (from a curated 3-4)? Self-pace or auto-scroll? Autonomy supports SDT-competence-relatedness triad.
- **Build in shared-reading affordances** (recordings to send to a parent/grandparent, parent dashboard that shows progress). Relatedness > extrinsic rewards.

---

## 9. Evidence-Based Protocols Worth Cribbing From

### HELPS (Helping Early Literacy with Practice Strategies)
- Begeny, NC State. WWC-recommended. Free.
- **Session: 15-20 minutes, 3x/week.**
- Scripted protocol blending 8 evidence-based fluency strategies: modeling, repeated reading, error correction, goal setting, performance feedback, contingent rewards, structured practice.
- **For your app: the 15-min × 3/week cadence is a defensible daily-target floor.**

### Read Naturally (Strategy)
- **Steps: Key Words → Cold Timing → Read Along (audio model) → Practice (self-paced) → Hot Timing → Comprehension Qs.**
- This is the workflow your app should default to. It's been the standard for 30 years and is built directly on Samuels' RR research.

### QuickReads (Hiebert, TextProject)
- Built around tightly-controlled text characteristics: high-frequency words, grade-appropriate phonics/syllable patterns, nonfiction content.
- **Key insight: text *characteristics* matter as much as text *level*.** Build passages from a controlled vocabulary list per language/grade. Don't grab arbitrary texts off the web.

### GreatLeaps
- Less research, more commercial. Probably skip.

### Design implication for the app

- **Steal the Read Naturally workflow wholesale.** It's not proprietary as a structure (only their materials are).
- **Adopt HELPS' 15-min × 3/week cadence as the "Goldilocks" parent-recommendation.** Default the streak target to "5 days this week" rather than 7.
- **Curate passages with controlled vocabulary** per QuickReads logic. Don't auto-scrape children's stories from the web — control the difficulty curve.

---

## 10. Risks and Contraindications

### What the research warns against

| Risk | Source | Mitigation |
|---|---|---|
| **Speed-over-comprehension drift.** Coaching to inflate WPM produces meaningless scores. | Shanahan; Hasbrouck herself ("ORF is more than speed") | Show prosody/accuracy feedback ahead of speed; require comprehension Qs every hot read. |
| **Frustration-level text damaging motivation.** While Betts' specific 95% number is unsupported, sustained failure does demotivate. | Shanahan acknowledges; Allington documents | Don't let any child read three consecutive passages with <60% accuracy. Suggest audio-model or easier story. |
| **Isolating reading from meaning.** Apps that drill on pronunciation alone can produce "word-callers" who decode without comprehending. | NRP; Shanahan; Pressley | Always pair reading with brief comprehension; show definitions; keep texts meaningful, not nonsense-syllable lists. |
| **Over-praise and intelligence-praise damaging growth mindset.** | Dweck et al. | Process-praise scripts in app feedback. |
| **Leaderboard / competitive shaming.** | SDT; multiple replications | Don't ship leaderboards. |
| **Extrinsic-reward overuse undermining intrinsic motivation.** | Overjustification effect (Lepper, Greene & Nisbett 1973+) | Rewards should reflect process and effort, not be the primary driver. |
| **Screen time at age 7.** AAP recommends ≤1 hr/day high-quality content for ages 2-5; for 6-8 the message is "consistent limits with high-quality content." | AAP | Cap suggested daily session at 20-25 min (matches HELPS). Send a "good stopping point" nudge. |
| **Recognizer mis-hearing creating false-negative frustration.** Web Speech API can mishear, especially L2 speech. | App-specific risk | Be forgiving: don't flag a word red until two consecutive listens disagree. Tune per language. |
| **Dyslexia-specific accommodations applied to non-dyslexic kids.** OpenDyslexic font, colored overlays. | Multiple null/negative studies | Don't make these defaults; offer as opt-ins with honest framing. |
| **Streak anxiety.** Children can become distressed when they break a streak. | Anecdotal but consistent; behavioral economics | Grace tokens; reframe broken streak as "let's start a new one — readers don't read every day, that's normal." |

### Design implication for the app

- **Build a "comprehension floor"**: a hot-timing isn't counted until the child answers at least 1 of 2 comprehension questions correctly. This is the single most important guard against speed-bias.
- **Session-length default 15 min, hard cap suggestion at 25 min.** Parent dashboard shows daily total.
- **Recognizer tuning matters more than UI polish at this age.** Budget engineering accordingly — a recognizer that misjudges 1 word in 10 will tank trust.
- **Copy review:** strip "smart", "fast", "the best" praise. Replace with "you worked through that", "you re-read the tricky part", "you tried a new story."
- **Parent-side messaging:** explain explicitly that the app is for *fluency practice*, not phonics, vocabulary, or comprehension teaching. Parents should expect the child to *also* be doing read-alouds, library visits, etc.

---

## Sources

**National Reading Panel:**
- [NICHD National Reading Panel Findings](https://www.nichd.nih.gov/publications/pubs/nrp/findings)
- [Reading Rockets — Findings of the National Reading Panel](https://www.readingrockets.org/topics/curriculum-and-instruction/articles/findings-national-reading-panel)

**Hasbrouck & Tindal 2017 ORF Norms:**
- [Technical Report #1702 (ERIC)](https://files.eric.ed.gov/fulltext/ED594994.pdf)
- [Reading Rockets — Fluency Norms Chart](https://www.readingrockets.org/topics/fluency/articles/fluency-norms-chart-2017-update)

**Repeated Reading (Samuels, Rasinski, Shanahan):**
- [Shanahan — Everything You Wanted to Know about Repeated Reading](https://www.shanahanonliteracy.com/blog/everything-you-wanted-to-know-about-repeated-reading)
- [Rasinski — Why Fluency Should Be Hot (PDF)](https://www.timrasinski.com/presentations/article_why_fluency_shd_be_hot__rt_may_2012.pdf)
- [Reading Rockets — Timed Repeated Readings](https://www.readingrockets.org/classroom/classroom-strategies/timed-repeated-readings)

**Instructional Level / Betts critique:**
- [Shanahan — The Instructional Level Concept Revisited](https://www.shanahanonliteracy.com/blog/the-instructional-level-concept-revisited-teaching-with-complex-text-1)
- [Shanahan — New Evidence on Teaching Reading at Frustration Levels](https://www.shanahanonliteracy.com/blog/new-evidence-on-teaching-reading-at-frustration-levels)
- [Education Next — Leveled Reading: The Making of a Literacy Myth](https://www.educationnext.org/leveled-reading-making-literacy-myth/)

**Speed vs Prosody:**
- [Shanahan — Oral Reading Fluency is More than Speed](https://www.shanahanonliteracy.com/blog/oral-reading-fluency-is-more-than-speed)
- [Shanahan — How Important is Reading Rate](https://www.shanahanonliteracy.com/blog/how-important-is-reading-rate)

**Text-fading / scrolling text research:**
- [Nuerk et al. — Text-fading based training PMC4322541](https://pmc.ncbi.nlm.nih.gov/articles/PMC4322541/)
- [MDPI 2024 — Scoping Review of Digital Technologies for Reading Fluency](https://www.mdpi.com/2227-7102/14/6/633)

**Fonts and dyslexia:**
- [OpenDyslexic on reading rate and accuracy — Wery & Diliberto 2017 (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5629233/)
- [SIL Andika literacy font](https://software.sil.org/andika/)

**Color overlays / Irlen:**
- [Griffiths 2016 systematic review — Ophthalmic and Physiological Optics](https://onlinelibrary.wiley.com/doi/abs/10.1111/opo.12316)
- [Controversial treatment using coloured overlays (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7727967/)

**Line length:**
- [Optimal Line Length in Reading — Literature Review](https://journals.uc.edu/index.php/vl/article/view/5765)

**Multilingual / L2:**
- [Seymour, Aro, & Erskine 2003 — Foundation literacy acquisition in European orthographies](https://eclass.uoa.gr/modules/document/file.php/PPP363/Seymour_Aro_Erskine.pdf)
- [Cummins — Linguistic interdependence (1979, SAGE)](https://journals.sagepub.com/doi/10.3102/00346543049002222)
- [Influences of L1 and L2 Phonology on Spanish Children Learning English (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8987578/)

**French fluency norms:**
- [ELFE / E.L.FE Cogni-Sciences (PDF)](https://barentin.circonscription.ac-normandie.fr/IMG/pdf/e.l.f.e.pdf)
- [Conseil scientifique de l'éducation nationale 2021 note](https://www.reseau-canope.fr/fileadmin/user_upload/Projets/conseil_scientifique_education_nationale/Note_CSEN_2021_02.pdf)

**Motivation, gamification, Dweck:**
- [Allington — Reading Volume and Reading Achievement](https://files.eric.ed.gov/fulltext/EJ1053794.pdf)
- [Allington — What Really Matters When Working With Struggling Readers](https://www.ocmboces.org/tfiles/folder1237/1603_allington_wrm.rt_.pdf)
- [Dweck — Praise for Intelligence Can Undermine Children's Motivation (1998)](https://cpb-us-w2.wpmucdn.com/web.sas.upenn.edu/dist/b/398/files/2019/04/1998-04530-003-1sagefw.pdf)
- [Gunderson et al. — Parent Praise and Motivational Frameworks (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3655123/)
- [SDT and Competition in Digital Game Design (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12412733/)

**Programs (HELPS, Read Naturally, QuickReads):**
- [HELPS — Intervention Central](https://www.interventioncentral.org/helps-reading-fluency-program)
- [Begeny — HELPS effects (Wiley)](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1540-5826.2011.00332.x)
- [Read Naturally Encore: Steps](https://www.readnaturally.com/article/read-naturally-encore-steps)
- [Hiebert & Fisher — Text Matters in Developing Fluent Reading](https://textproject.org/wp-content/uploads/papers/Hiebert-Fisher-2002b.pdf)

**Screen time:**
- [AAP — Media and Young Minds (2016)](https://publications.aap.org/pediatrics/article/138/5/e20162591/60503/Media-and-Young-Minds)
