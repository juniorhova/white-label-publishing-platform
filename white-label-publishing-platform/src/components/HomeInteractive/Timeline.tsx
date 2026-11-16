import type { ContentBlock } from '@/payload-types'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'
import { columnTitle } from './content'
import styles from './home-interactive.module.css'

export function Timeline({ columns, sectionTitle }: ContentBlock) {
  return (
    <section
      className={`container ${styles.section}`}
      id="trajetoria"
      aria-label={sectionTitle || 'Minha trajetória'}
    >
      <h2 className={styles.sectionTitle}>{sectionTitle || 'Minha trajetória'}</h2>
      <div className={styles.timeline}>
        {columns?.map((column, index) => (
          <article className={styles.experience} key={column.id || index}>
            <div className={styles.companyRail}>
              <div className={styles.company}>
                <h3>{columnTitle(column, 'Experiência profissional')}</h3>
                {column.period && <p>{column.period}</p>}
                <span className={styles.timelineDot} aria-hidden="true" />
              </div>
            </div>
            <div className={styles.experienceBody}>
              {!!column.photos?.length && (
                <div className={styles.gallery} aria-label="Fotos da experiência" tabIndex={0}>
                  {column.photos.map(
                    ({ image, id }) =>
                      typeof image === 'object' &&
                      image && (
                        <Media
                          key={id}
                          resource={image}
                          className={styles.photo}
                          imgClassName={styles.photoImage}
                          size="(max-width: 640px) 85vw, 550px"
                        />
                      ),
                  )}
                </div>
              )}
              {column.richText && (
                <RichText
                  data={{
                    ...column.richText,
                    root: {
                      ...column.richText.root,
                      children: column.richText.root.children.filter(
                        (_node, index) =>
                          index !==
                          column.richText!.root.children.findIndex(
                            (node) => node.type === 'heading',
                          ),
                      ),
                    },
                  }}
                  enableGutter={false}
                  className={styles.experienceText}
                />
              )}
              {column.enableLink && (
                <CMSLink {...column.link} appearance="inline" className={styles.sourceLink} />
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
