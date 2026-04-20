import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Methods & Attributions | Maya Allan",
  description:
    "The research and practitioners whose work informs the reflection tools on this site. Attribution to the originators of Internal Family Systems, Clean Language, Coherence Therapy, and Motivational Interviewing.",
}

export default function MethodsPage() {
  return (
    <div className="bg-white min-h-[calc(100dvh-80px)] px-5 sm:px-8 py-10 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal mb-6">
          Methods &amp; Attributions
        </h1>

        <p className="text-charcoal-soft text-base leading-relaxed mb-8">
          The reflection tools on this site draw on established, peer-reviewed
          approaches to self-inquiry, somatic regulation, and integration. They
          are not those methods, and neither Maya Allan nor this site claims
          certification, affiliation, or training in any of the following. The
          tools are educational reflection aids, not therapy.
        </p>

        <section className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-charcoal mb-2">
            Internal Family Systems (IFS)
          </h2>
          <p className="text-charcoal-soft text-sm leading-relaxed">
            Developed by Dr. Richard C. Schwartz. The Nervous System Reset tool
            draws on IFS language around parts, the 8 Cs of Self (particularly
            Curiosity and Compassion), and the 6 Fs protocol for relating to an
            activated state as a part doing a protective job. &ldquo;Internal
            Family Systems&rdquo; and &ldquo;IFS&rdquo; are trademarks of the IFS
            Institute. Further reading: <em>No Bad Parts</em> (Schwartz, 2021).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-charcoal mb-2">
            Clean Language
          </h2>
          <p className="text-charcoal-soft text-sm leading-relaxed">
            Developed by David Grove (1950&ndash;2008) and systematized by Penny
            Tompkins and James Lawley. The Belief Inquiry tool uses Clean
            Language&apos;s two primary questions (&ldquo;What kind of X is that
            X?&rdquo; and &ldquo;Is there anything else about X?&rdquo;) to
            reflect the user&apos;s own words back without introducing the
            facilitator&apos;s metaphors or frames. Further reading:{" "}
            <em>Metaphors in Mind</em> (Lawley &amp; Tompkins, 2000).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-charcoal mb-2">
            Coherence Therapy
          </h2>
          <p className="text-charcoal-soft text-sm leading-relaxed">
            Developed by Bruce Ecker, Laurel Hulley, and Robin Ticic. The
            Integration tool draws on Coherence Therapy&apos;s juxtaposition
            experience, linked in published research to the neural process of
            memory reconsolidation. It does not install replacement beliefs;
            it helps hold the old pattern alongside a contradictory lived
            experience. Further reading:{" "}
            <em>Unlocking the Emotional Brain</em> (Ecker, Ticic &amp; Hulley,
            2012).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-charcoal mb-2">
            Motivational Interviewing (OARS)
          </h2>
          <p className="text-charcoal-soft text-sm leading-relaxed">
            Developed by William R. Miller and Stephen Rollnick. Open
            questions, affirmations, reflections, and summaries (OARS) inform
            the conversational style of all three tools. The tools do not
            attempt to evoke change talk in the clinical MI sense. Further
            reading: <em>Motivational Interviewing: Helping People Change</em>{" "}
            (Miller &amp; Rollnick, 4th ed., 2023).
          </p>
        </section>

        <section className="mb-8 p-5 rounded-xl bg-[#F0F7FF]/40 border border-[#D6E8FA]/50">
          <h3 className="font-serif text-base font-semibold text-charcoal mb-2">
            Safety note
          </h3>
          <p className="text-charcoal-soft text-sm leading-relaxed">
            These tools do not diagnose, prescribe, or treat. They are not a
            substitute for licensed mental health care. If you are in crisis,
            call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline).
            If you are processing trauma, working with a trauma-informed
            professional will serve you better than any AI tool can.
          </p>
        </section>

        <footer className="mt-10 text-charcoal-soft/70 text-xs">
          <Link href="/tools" className="hover:text-liquid-blue transition-colors">
            ← Back to Tools
          </Link>
        </footer>
      </div>
    </div>
  )
}
