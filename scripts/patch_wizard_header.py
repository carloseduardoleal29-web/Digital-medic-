import re

with open('src/components/ProgressiveRecipeWizard.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Locate top header in ProgressiveRecipeWizard
idx_start = code.find('{/* Sticky Top Bar: Navegación y Pasos rápidos */}')
if idx_start == -1:
    idx_start = code.find('Asistente Guiado Progresivo')

print("Found wizard header index:", idx_start)

# Let's inspect the block from idx_start to grid-cols-4
idx_grid = code.find('grid grid-cols-4 gap-1.5', idx_start)
print("Snippet to replace:\n", code[idx_start-50:idx_grid])

old_header_block = code[idx_start-50:idx_grid]

new_header_block = """{/* Sticky Top Bar: Navegación y Pasos rápidos */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 sm:p-3 shadow-md space-y-2 no-print">
        {/* Header Controls Bar */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          <div className="flex items-center gap-1.5 min-w-0">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1 text-xs transition-colors cursor-pointer shrink-0"
                title="Volver al inicio"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="hidden sm:inline">Inicio</span>
              </button>
            )}
            <span className="px-2 py-1 bg-blue-50 border border-blue-200/80 text-blue-700 rounded-xl text-[11px] sm:text-xs font-black shadow-2xs flex items-center gap-1 truncate">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Asistente Progresivo</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenPreviewModal && (
              <button
                type="button"
                onClick={onOpenPreviewModal}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 font-extrabold rounded-xl text-[11px] sm:text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-slate-700 shrink-0"
                title="Ver plantilla y formato con membrete, firma y sellos"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="whitespace-nowrap">Ver Formato Base</span>
              </button>
            )}
            {onClearRecipeToBlank && (
              <button
                type="button"
                onClick={onClearRecipeToBlank}
                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer border border-rose-200 shrink-0"
                title="Limpiar datos y empezar de nuevo"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
              </button>
            )}
          </div>
        </div>

        """

code = code[:idx_start-50] + new_header_block + code[idx_grid:]

with open('src/components/ProgressiveRecipeWizard.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: Updated ProgressiveRecipeWizard header.")
