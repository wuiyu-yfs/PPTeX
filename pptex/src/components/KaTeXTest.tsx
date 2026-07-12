import katex from 'katex'

interface FormulaExample {
  label: string
  latex: string
  isBlock?: boolean
}

const formulaExamples: FormulaExample[] = [
  { label: '质能方程', latex: 'E = mc^2', isBlock: true },
  { label: '牛顿第二定律', latex: 'F = ma', isBlock: true },
  { label: '欧拉公式', latex: 'e^{i\\pi} + 1 = 0', isBlock: true },
  { label: '积分公式', latex: '\\int_a^b f(x)\\,dx = F(b) - F(a)', isBlock: true },
  { label: '行内公式', latex: '$ax^2 + bx + c = 0$', isBlock: false },
  { label: '矩阵', latex: '\\begin{pmatrix} a & b \\ c & d \\end{pmatrix}', isBlock: true },
  { label: '分数', latex: '\\frac{n!}{k!(n-k)!}', isBlock: true },
  { label: '极限', latex: '\\lim_{x \\to \\infty} \\frac{1}{x} = 0', isBlock: true },
]

function renderLatex(latex: string, isBlock: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode: isBlock,
      throwOnError: false,
      errorColor: '#cc0000',
    })
  } catch (e) {
    return `<span class="text-red-500">渲染错误: ${e instanceof Error ? e.message : '未知错误'}</span>`
  }
}

export default function KaTeXTest() {
  return (
    <div className="space-y-4">
      {formulaExamples.map((example, index) => (
        <div key={index} className="border border-gray-200 rounded p-4">
          <div className="text-sm text-gray-500 mb-2">{example.label}</div>
          {example.isBlock ? (
            <div
              className="formula-block text-center"
              dangerouslySetInnerHTML={{ __html: renderLatex(example.latex, true) }}
            />
          ) : (
            <div
              className="paragraph"
              dangerouslySetInnerHTML={{ __html: renderLatex(example.latex.replace(/\$/g, ''), false) }}
            />
          )}
          <div className="mt-2 text-xs text-gray-400 font-mono bg-gray-100 p-2 rounded">
            {example.latex}
          </div>
        </div>
      ))}
    </div>
  )
}