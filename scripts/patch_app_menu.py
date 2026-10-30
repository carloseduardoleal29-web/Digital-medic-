import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Locate top row block and module grid in App.tsx
old_top_nav = """              {/* Top Row: Navigation Breadcrumb & Clear Button (Compact inline row on both mobile and desktop) */}
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={() => handleNavigate('inicio')}
                    className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-blue-400/30 shrink-0"
                    title="Regresar a la pantalla principal de módulos"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                    <span>Volver al Inicio</span>
                  </button>
                  <div className="hidden sm:flex items-center gap-1 text-slate-500 font-bold text-xs truncate">
                    <button 
                      onClick={() => handleNavigate('inicio')}
                      className="hover:text-blue-600 transition-colors flex items-center gap-1 text-slate-600 cursor-pointer"
                    >
                      <Home className="w-3.5 h-3.5 text-blue-500" />
                      <span>Inicio</span>
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-900 font-extrabold flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200/80 truncate">
                      {activeModule === 'recipe-master' && '💊 Récipes Médicos'}
                      {activeModule === 'examenes' && '🔬 Exámenes y Laboratorios'}
                      {activeModule === 'indicaciones' && '🕐 Indicaciones'}
                      {activeModule === 'informes' && '📋 Informe Médico'}
                      {activeModule === 'reposo' && '⏱️ Constancia / Reposo'}
                      {activeModule === 'historias' && '📁 Historia Clínica'}
                      {activeModule === 'diseno' && '🎨 Estudio de Diseño'}
                      {activeModule === 'suscripcion' && '💳 Suscripción'}
                    </span>
                  </div>
                </div>
                {/* Right: Dejar en Blanco (Compact inline) */}
                {activeModule !== 'diseno' && activeModule !== 'suscripcion' && (
                  <button
                    type="button"
                    onClick={handleClearActiveModuleToBlank}
                    className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer border border-rose-500 shrink-0"
                    title="Dejar en blanco este formato para un nuevo paciente"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white shrink-0" />
                    <span className="whitespace-nowrap">Dejar en Blanco</span>
                  </button>
                )}
              </div>"""

new_top_nav = """              {/* Top Row: Navigation Buttons (Equal 2-Column Grid on Mobile, Flex on Desktop) */}
              <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2 w-full">
                <button
                  type="button"
                  onClick={() => handleNavigate('inicio')}
                  className="w-full sm:w-auto px-3 py-2 sm:px-3.5 sm:py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-blue-400/30"
                  title="Regresar a la pantalla principal de módulos"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  <span className="whitespace-nowrap font-black">Volver al Inicio</span>
                </button>

                {/* Breadcrumb path for desktop */}
                <div className="hidden sm:flex items-center gap-1 text-slate-500 font-bold text-xs truncate">
                  <button 
                    onClick={() => handleNavigate('inicio')}
                    className="hover:text-blue-600 transition-colors flex items-center gap-1 text-slate-600 cursor-pointer"
                  >
                    <Home className="w-3.5 h-3.5 text-blue-500" />
                    <span>Inicio</span>
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-900 font-extrabold flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200/80 truncate">
                    {activeModule === 'recipe-master' && '💊 Récipes Médicos'}
                    {activeModule === 'examenes' && '🔬 Exámenes y Laboratorios'}
                    {activeModule === 'indicaciones' && '🕐 Indicaciones'}
                    {activeModule === 'informes' && '📋 Informe Médico'}
                    {activeModule === 'reposo' && '⏱️ Constancia / Reposo'}
                    {activeModule === 'historias' && '📁 Historia Clínica'}
                    {activeModule === 'diseno' && '🎨 Estudio de Diseño'}
                    {activeModule === 'suscripcion' && '💳 Suscripción'}
                  </span>
                </div>

                {/* Right: Dejar en Blanco */}
                {activeModule !== 'diseno' && activeModule !== 'suscripcion' && (
                  <button
                    type="button"
                    onClick={handleClearActiveModuleToBlank}
                    className="w-full sm:w-auto px-3 py-2 sm:px-3.5 sm:py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer border border-rose-500"
                    title="Dejar en blanco este formato para un nuevo paciente"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white shrink-0" />
                    <span className="whitespace-nowrap font-black">Dejar en Blanco</span>
                  </button>
                )}
              </div>"""

if old_top_nav in code:
    code = code.replace(old_top_nav, new_top_nav, 1)
    print("SUCCESS: Updated top navigation bar in App.tsx.")
else:
    print("Warning: old_top_nav not found in App.tsx.")

# Now update the grid columns and button labels in module grid
old_grid_start = '<div className="grid grid-cols-4 md:grid-cols-7 gap-1.5 sm:gap-2">'
new_grid_start = '<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5 sm:gap-2">'

if old_grid_start in code:
    code = code.replace(old_grid_start, new_grid_start, 1)
    print("SUCCESS: Updated module grid columns to 3 columns on mobile.")

# Remove truncate class from module button labels
code = code.replace('truncate w-full text-center">Récipes</span>', 'whitespace-nowrap font-black text-center">Récipes</span>')
code = code.replace('truncate w-full text-center">Exámenes</span>', 'whitespace-nowrap font-black text-center">Exámenes</span>')
code = code.replace('truncate w-full text-center">Indicaciones</span>', 'whitespace-nowrap font-black text-center">Indicaciones</span>')
code = code.replace('truncate w-full text-center">Informes</span>', 'whitespace-nowrap font-black text-center">Informes</span>')
code = code.replace('truncate w-full text-center">Reposo</span>', 'whitespace-nowrap font-black text-center">Reposo</span>')
code = code.replace('truncate w-full text-center">Historias</span>', 'whitespace-nowrap font-black text-center">Historias</span>')
code = code.replace('truncate w-full text-center">Diseño</span>', 'whitespace-nowrap font-black text-center">Diseño</span>')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: App.tsx patched.")
