import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace top row wrapper
p = code.find('{/* Top Row: Navigation Breadcrumb & Clear Button')
p_end = code.find('{/* Bottom: Menú de Módulos Compacto', p)

if p != -1 and p_end != -1:
    new_top_row = """{/* Top Row: Navigation Buttons (Equal 2-Column Grid on Mobile, Flex on Desktop) */}
              <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2 w-full">
                <button
                  type="button"
                  onClick={() => handleNavigate('inicio')}
                  className="w-full sm:w-auto px-3 py-2 sm:px-3.5 sm:py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-blue-400/30"
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
                    className="w-full sm:w-auto px-3 py-2 sm:px-3.5 sm:py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer border border-rose-500"
                    title="Dejar en blanco este formato para un nuevo paciente"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white shrink-0" />
                    <span className="whitespace-nowrap font-black">Dejar en Blanco</span>
                  </button>
                )}
              </div>
              """
    code = code[:p] + new_top_row + code[p_end:]
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("SUCCESS: Updated top navigation row in App.tsx.")
else:
    print(f"Error: Could not locate top nav markers (p={p}, p_end={p_end})")
