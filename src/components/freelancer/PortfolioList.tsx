interface PortfolioItem {
  title: string
  description: string
}

interface PortfolioListProps {
  items: PortfolioItem[]
}

export function PortfolioList({ items }: PortfolioListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item, index) => (
        <div key={index} className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-900">{item.title}</h3>
          <p className="mt-2 text-gray-600 text-sm">{item.description}</p>
        </div>
      ))}
    </div>
  )
} 