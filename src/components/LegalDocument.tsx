import { Fragment } from "react";

export interface LegalSection {
  id: string;
  heading: string;
  body: string[];
  list?: string[];
}

export interface LegalDocumentContent {
  title: string;
  updatedOn: string;
  intro: string[];
  sections: LegalSection[];
  closingNote?: string;
}

interface LegalDocumentProps {
  content: LegalDocumentContent;
}

export function LegalDocument({ content }: LegalDocumentProps) {
  return (
    <section className="pt-32 pb-24 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400 mb-3">
            {content.updatedOn}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">
            {content.title}
          </h1>
        </div>

        <div className="space-y-6 text-lg text-gray-300">
          {content.intro.map((paragraph, index) => (
            <p key={`intro-${index}`} className="leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-14 space-y-12">
          {content.sections.map((section) => (
            <article key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                {section.heading}
              </h2>
              <div className="space-y-4 text-gray-300 text-base leading-relaxed">
                {section.body.map((paragraph, index) => (
                  <p key={`${section.id}-paragraph-${index}`}>{paragraph}</p>
                ))}
                {section.list && section.list.length > 0 && (
                  <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-300">
                    {section.list.map((item, index) => (
                      <li key={`${section.id}-list-${index}`}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>

        {content.closingNote && (
          <div className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-8 text-base text-gray-200 leading-relaxed">
            {content.closingNote.split("\n").map((line, index) => (
              <Fragment key={`closing-${index}`}>
                {index > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
