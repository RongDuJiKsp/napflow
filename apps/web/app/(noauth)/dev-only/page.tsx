const elementPaths: Record<string, string> = {
  'components-test': 'component-test',
}

export default function Page() {
  return (
    <div>
      {Object.entries(elementPaths).map(([key, value]) => (
        <>
          <a href={`/dev-only/${value}`} key={key}>
            {key}
          </a>
        </>
      ))}
    </div>
  )
}
