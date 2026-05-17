import { z } from 'zod'

export type SiteSettingFieldType = 'text' | 'textarea' | 'url'

export interface SiteSettingDefinition {
  key: string
  label: string
  description: string
  group: string
  fieldType: SiteSettingFieldType
  defaultValue: string
  sortOrder: number
}

export const siteSettingDefinitions = [
  {
    key: 'home_eyebrow',
    label: 'Homepage small label',
    description: 'Small text above the main homepage headline.',
    group: 'Homepage Hero',
    fieldType: 'text',
    defaultValue: 'Parent Resource Hub',
    sortOrder: 10,
  },
  {
    key: 'home_headline',
    label: 'Homepage headline',
    description: 'Large main headline on the homepage.',
    group: 'Homepage Hero',
    fieldType: 'text',
    defaultValue: "Welcome to Allison's Classroom.",
    sortOrder: 20,
  },
  {
    key: 'home_subheadline',
    label: 'Homepage description',
    description: 'Short paragraph under the homepage headline.',
    group: 'Homepage Hero',
    fieldType: 'textarea',
    defaultValue: "One warm, organized place for announcements, assignments, schedules, links, and classroom moments for Allison's 5th and 6th grade families.",
    sortOrder: 30,
  },
  {
    key: 'home_primary_cta_label',
    label: 'Primary button text',
    description: 'Main homepage button wording.',
    group: 'Homepage Buttons',
    fieldType: 'text',
    defaultValue: 'See Latest News',
    sortOrder: 40,
  },
  {
    key: 'home_primary_cta_href',
    label: 'Primary button link',
    description: 'Where the main homepage button sends families.',
    group: 'Homepage Buttons',
    fieldType: 'url',
    defaultValue: '/news',
    sortOrder: 50,
  },
  {
    key: 'home_secondary_cta_label',
    label: 'Secondary button text',
    description: 'Second homepage button wording.',
    group: 'Homepage Buttons',
    fieldType: 'text',
    defaultValue: 'Open Parent Links',
    sortOrder: 60,
  },
  {
    key: 'home_secondary_cta_href',
    label: 'Secondary button link',
    description: 'Where the second homepage button sends families.',
    group: 'Homepage Buttons',
    fieldType: 'url',
    defaultValue: '/links',
    sortOrder: 70,
  },
  {
    key: 'home_board_title',
    label: 'Class board title',
    description: 'Large title inside the homepage classroom board.',
    group: 'Homepage Board',
    fieldType: 'text',
    defaultValue: 'Today in class',
    sortOrder: 80,
  },
  {
    key: 'home_board_badge',
    label: 'Class board badge',
    description: 'Small badge text beside the classroom board title.',
    group: 'Homepage Board',
    fieldType: 'text',
    defaultValue: 'live board',
    sortOrder: 90,
  },
  {
    key: 'quick_access_heading',
    label: 'Quick access heading',
    description: 'Heading above the family shortcut boxes.',
    group: 'Homepage Sections',
    fieldType: 'text',
    defaultValue: 'Family shortcuts',
    sortOrder: 100,
  },
  {
    key: 'classes_heading',
    label: 'Class section heading',
    description: 'Heading above the class cards.',
    group: 'Homepage Sections',
    fieldType: 'text',
    defaultValue: 'Choose a class',
    sortOrder: 110,
  },
  {
    key: 'classes_description',
    label: 'Class section description',
    description: 'Short paragraph beside the class section heading.',
    group: 'Homepage Sections',
    fieldType: 'textarea',
    defaultValue: "Each class page keeps families focused on the assignments and resources that match the student’s schedule.",
    sortOrder: 120,
  },
] as const satisfies readonly SiteSettingDefinition[]

export type SiteSettingKey = typeof siteSettingDefinitions[number]['key']

export type SiteSettingsMap = Record<SiteSettingKey, string>

const definitionByKey = new Map<string, SiteSettingDefinition>(siteSettingDefinitions.map(definition => [definition.key, definition]))

export function getSiteSettingDefinition(key: string) {
  return definitionByKey.get(key)
}

export function getDefaultSiteSettings(): SiteSettingsMap {
  return siteSettingDefinitions.reduce((settings, definition) => {
    settings[definition.key as SiteSettingKey] = definition.defaultValue
    return settings
  }, {} as SiteSettingsMap)
}

export function mergeSiteSettings(rows: Array<{ key: string; value: string | null }> = []) {
  const settings = getDefaultSiteSettings()

  for (const row of rows) {
    if (!getSiteSettingDefinition(row.key)) continue
    settings[row.key as SiteSettingKey] = row.value || getSiteSettingDefinition(row.key)?.defaultValue || ''
  }

  return settings
}

export function siteSettingsForRows(settings: Partial<Record<SiteSettingKey, string>>) {
  return siteSettingDefinitions.map(definition => ({
    key: definition.key,
    label: definition.label,
    description: definition.description,
    group_name: definition.group,
    field_type: definition.fieldType,
    value: settings[definition.key] ?? definition.defaultValue,
    sort_order: definition.sortOrder,
  }))
}

const relativeOrAbsoluteUrl = z.string()
  .trim()
  .min(1, 'Link required')
  .max(2000, 'Link is too long')
  .refine(value => value.startsWith('/') || value.startsWith('https://') || value.startsWith('http://'), 'Use a site path like /links or a full URL')

export const siteSettingsUpdateSchema = z.object({
  settings: z.record(z.string(), z.string().max(2000)).superRefine((settings, context) => {
    for (const [key, value] of Object.entries(settings)) {
      const definition = getSiteSettingDefinition(key)
      if (!definition) {
        context.addIssue({ code: 'custom', message: `Unknown editable field: ${key}`, path: [key] })
        continue
      }

      const trimmed = value.trim()
      if (!trimmed) {
        context.addIssue({ code: 'custom', message: `${definition.label} cannot be empty`, path: [key] })
        continue
      }

      if (definition.fieldType === 'url') {
        const parsed = relativeOrAbsoluteUrl.safeParse(trimmed)
        if (!parsed.success) {
          context.addIssue({ code: 'custom', message: parsed.error.issues[0]?.message || 'Invalid link', path: [key] })
        }
      }
    }
  }),
})

export type SiteSettingsUpdateInput = z.infer<typeof siteSettingsUpdateSchema>
