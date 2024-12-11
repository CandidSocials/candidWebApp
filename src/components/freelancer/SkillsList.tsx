interface SkillsListProps {
  skills: string[]
}

export function SkillsList({ skills }: SkillsListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
        >
          {skill}
        </span>
      ))}
    </div>
  )
} 