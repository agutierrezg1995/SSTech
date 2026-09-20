/* =====================================================================
   Datos del formato FT-OPE-06 v07 (esquema del formulario).
   Este objeto puede regenerarse desde data.json en el backend.
   ===================================================================== */
const DATOS_FORMATO = {
  meta: { code: "FT-OPE-06", fecha: "mar-2023", version: "07" },
  titulo: "PERMISO DE TRABAJO EN CAMPO",
  localizacion: ["PLANTA", "PARQUE INDUSTRIAL", "PUNTO DE VENTA", "GRANJA", "OTRO", "CUÁL:"],
  tareas: [
    { n: 1, nombre: "Izaje de cargas", short: "IZAJE" },
    { n: 2, nombre: "Trabajo en Caliente", short: "CALIENTE" },
    { n: 3, nombre: "Trabajos de Armado y Montaje", short: "ARMADO" },
    { n: 4, nombre: "Ingreso espacios confinados", short: "CONFINADOS" },
    { n: 5, nombre: "Trabajo con energías peligrosas", short: "ENERGÍAS" },
    { n: 6, nombre: "Trabajos sobre Red de frio/ Freón, Glicol, NH3", short: "RED FRÍO" }
  ],
  epp: [
    "Casco", "Casco con Barboquejo", "Gafas de Seguridad", "Monogafas",
    "Guantes de Vaquetas", "Guantes de Nitrilo", "Guantes Dieléctrico", "Delantal",
    "Máscara Completa", "Máscara Con Filtro", "Mascarilla Desechable", "Careta",
    "Polaina y cofia", "Botas Con Puntera", "Gorro para soldador", "Visor Contra partículas",
    "Filtro Contra amoníaco", "Protectores Auditivos", "Arnés Cuerpo Completo",
    "Eslinga Y con Absorbedor", "Eslinga y sin Absorbedor", "Eslinga de Posicionamiento"
  ],
  mediciones: [
    { k: "comb", l: "% COMB", tar: "2,4" },
    { k: "prop", l: "% PROP", tar: "2,4" },
    { k: "nh3", l: "Amoníaco ppm", tar: "2,4" },
    { k: "h2s", l: "H2S ppm", tar: "2,4" },
    { k: "o2", l: "% de Oxígeno", tar: "2,4" },
    { k: "co", l: "CO ppm", tar: "2,4" }
  ],
  checklists: {
    general: {
      titulo: "GENERAL - TODOS LOS TRABAJOS",
      items: [
        "Los ejecutantes afirman e informan que no han tenido en las últimas 48 horas, traumas cráneo-encefálico, mareos, ingerido bebidas embriagantes o medicamentos que puedan afectar el equilibrio, causar somnolencia, intoxicaciones, calambres, etc.",
        "El trabajo que va a ser realizado, se verificó en conjunto con el solicitante (usuario) y el ejecutante?",
        "El Ejecutante informó a todos los trabajadores del área sobre la ejecución del respectivo trabajo?",
        "El equipo ejecutante tiene y conoce los procedimientos aplicables al respectivo trabajo?",
        "El equipo ejecutante tiene debidamente planeada la forma de realizar el respectivo trabajo?",
        "El área fue señalizada y/o aislada para impedir el acceso por todos los puntos de ingreso?",
        "Los ejecutantes disponen de los EPP necesarios, los saben emplear y están en adecuado estado?",
        "Las máquinas/equipos y herramientas fueron inspeccionados y están en adecuado estado de funcionamiento?",
        "El ejecutante garantiza la presencia permanente de otro trabajador para la realización con mínimo dos personas?",
        "Los dispositivos de bloqueo y rotulado de máquinas y servicios, son los necesarios de acuerdo al Plan de Bloqueo?",
        "Los huecos en pisos y plataformas están debidamente señalizados y/o aislados para prevenir caídas?",
        "Los andamios y/o accesos son adecuados en armado, barandas y resistencias para ejecutar el trabajo?",
        "Las líneas de equipos fueron despresurizados y/o drenados?",
        "La iluminación en el área es suficiente, inclusive para las personas que están cerca de la zona de trabajo?",
        "Fueron tomadas precauciones para identificar la existencia de tuberías, líneas eléctricas y electroductos enterrados?",
        "El área donde se ejecutará el trabajo, esta determinada como área Clasificada de riesgo Eléctrico (Norma RETIE)",
        "En caso de que el punto anterior se presente: las luminarias u otros equipos eléctricos son a prueba de explosión?",
        "Están disponibles los recursos para disponer y controlar vertimientos y sustancias agresivas al medio ambiente?",
        "El trabajo que se realizará cuenta con las condiciones atmosféricas idóneas para no generar riesgos adicionales, Ej.: lluvia",
        "El área donde se ejecutará el trabajo u operación está protegida contra ejecuciones no programadas por parte de trabajos externos que afecten la seguridad? (Ej.: Circulación de vehículos, trabajos simultáneos de otros contratistas, etc.)"
      ]
    },
    izaje: {
      titulo: "1. TRABAJOS CON IZAJE DE CARGAS",
      items: [
        "La grúa cuenta con la certificación técnico mecánica y vigente que certifique el óptimo funcionamiento mecánico, emitida por el Ministerio de Tránsito y Transporte?",
        "Fue establecido y aprobado el plan y el plano de izamiento de carga y esta disponible en la zona de trabajo?",
        "Hay un responsable establecido para la señalización de operación de izamiento de carga?",
        "Se ha establecido barreras de control suficiente y dentro del radio de operación de la grúa para evitar que personas entren a la zona de cargas suspendidas?",
        "La superficie donde se ubicará la grúa para el izaje de la carga es completamente resistente al total de la carga?",
        "Los operadores de la grúa poseen la certificación de competencia para la operación?",
        "La capacidad de carga esta claramente identificada en el vehículo o grúa y es cumplida?",
        "La carga esta protegida contra rotaciones, deslizamientos o movimientos involuntarios?",
        "La carga será izada solamente en dirección vertical sin formación de ángulos?",
        "Se inspeccionaron antes del funcionamiento los controles eléctricos, caminos del recorrido de la grúa, interruptores?",
        "El diámetro del cable, terminales de conexiones, deformaciones y estiramientos en los ganchos, están adecuados?",
        "No existen alambre rotos que excedan el 10% del número total de alambres en un rango de ocho veces el diámetro del cable?",
        "El diámetro del cable terminales de conexiones, deformaciones y estiramientos de los ganchos, están adecuados?",
        "Se conoce el peso de la carga a levantar y la grúa tiene la capacidad para levantar la carga?",
        "Se ha asignado una persona calificada para liberación de amarres e izamiento de cargas?",
        "Se solicitó y se verificó la ficha de inspección, pruebas y mantenimiento exigidas por OSHA-CMAA para la grúa?",
        "La carga a izar está atada y balanceada correctamente?",
        "Los estabilizadores de la grúa están completamente nivelados y sobre piso firme?",
        "El gancho de izaje no presenta deformaciones y posee seguro anti abertura?",
        "La pluma de la grúa durante la operación de trabajo esta libre de contactos accidentales con cables eléctricos?",
        "La grúa esta posicionada con cuatro patas antivolteo?"
      ]
    },
    caliente: {
      titulo: "2. TRABAJOS EN CALIENTE",
      items: [
        "Los materiales inflamables que pudieran salir a la atmósfera fueron retirados o están controlados mediante bloqueo?",
        "Los cables eléctricos temporales están en buen estado, sobre zonas secas, son aéreos en áreas de circulación y son encauchetados?",
        "El equipo y las tuberías están aislados con flanche ciego, drenados y desconectados?",
        "El equipo o tuberías fueron drenados, lavados, ventilados, purgados y limpiados?",
        "Fueron tomadas precauciones para la liberación accidental de vapores/gases inflamables en el área?",
        "Están disponibles en cantidad suficientes los equipos (Extintores, etc) para combatir incendios en el área?",
        "Fue realizado test de presencia de gases inflamables/tóxicos en tanques, manholes, líneas, cajas y canaletas?",
        "Las manguera de cilindros de oxígeno y acetileno están en buen estado (no están rasgadas, ni cortadas, ni reparadas)?",
        "La válvula corta-llamas y la línea de la manguera próximas han sido marcadas en las salidas de los cilindros?",
        "El equipo de soldadura esta conectado a tierra, y esta ubicado en un lugar seco y en un área clasificada como segura?",
        "Los ejecutantes conocen el procedimiento de apagar un potencial fuego generado en este trabajo?",
        "Han sido ubicadas las mamparas, biombos o gabinetes para protección de personas y materiales ante las chispas?",
        "Se tienen disponibles procedimientos para drenado de materiales o de aislamiento con mantas incombustibles?",
        "Se ha limpiado adecuadamente el área para evitar presencia de materiales combustibles o inflamables?"
      ]
    },
    armado: {
      titulo: "3. TRABAJOS DE ARMADO Y MONTAJE",
      items: [
        "El equipo de montaje cuenta con certificación y/o experiencia verificada para el tipo de montaje a ejecutar?",
        "El plan de maniobras y la secuencia de armado fueron comunicados y aprobados por el responsable del área?",
        "La zona de armado/montaje cuenta con espacio y condiciones seguras para maniobrar elementos y personal?",
        "Los elementos de izaje y/o herramientas para el montaje fueron inspeccionados y están en buen estado?"
      ]
    },
    confinados: {
      titulo: "4. INGRESO A ESPACIOS CONFINADOS",
      items: [
        "El equipo ejecutor tiene identificados los peligros de la atmósfera de este espacio y su forma de ocurrencia?",
        "Existe medios apropiados y asegurados para acceso y salida en forma segura desde el espacio confinado? (Calderas, tanques)",
        "Fue realizada la medición de concentración de oxígeno y gases inflamables/tóxicos?",
        "Conocen todos los ejecutantes el área donde ejecutarán el trabajo e inspeccionaron los alrededores?",
        "El equipo de rescate tiene disponible en la zona los elementos para un eventual rescate?",
        "Existe un acompañante disponible con equipo de comunicación y entrenamiento en rescate en este equipo?",
        "Los ejecutantes están usando arnés de seguridad, eslinga y líneas de aseguramiento en buen estado?",
        "Los comandos de motores, agitadores, bandas eléctricas y otros dispositivos fueron bloqueados y etiquetados?",
        "Las llaves y cortacircuitos de circuitos eléctricos fueron desconectados, señalizados y bloqueados?",
        "Se dispone de equipo de suministro de aire autocontenido para rescate de emergencia?",
        "La posibilidad de retorno de corriente o de flujos de materiales esta controlada?",
        "Los ejecutantes están unidos a línea de vida que llega hasta el exterior del espacio confinado?",
        "Dentro del compartimiento el equipo móvil está asegurado para que no se mueva (aspas, cuerpos de molienda, cadenas, etc)?",
        "Son necesarias herramientas con aislamiento especial o a prueba de explosión?",
        "Fueron instalados inyectores/extractores para ventilación?",
        "Están disponibles las máscaras con línea de aire o equipos de autocontenido en número suficiente para el trabajo?"
      ]
    },
    energias: {
      titulo: "5. TRABAJOS CON ENERGÍAS PELIGROSAS",
      items: [
        "Las fuentes de energía están desenergizadas/desconectadas y los bloqueos instalados?",
        "Los candados individuales y etiquetas están correctamente ubicados en los puntos de bloqueo?",
        "Los equipos, dispositivos y herramientas eléctricas poseen aislamiento adecuado?",
        "Los ejecutantes están certificados de acuerdo al RETIE, tienen a la mano y conocen los procedimientos de ingreso a zona con línea energizada?",
        "Fueron previstos los EPP adecuados para trabajar en línea viva con tensión ___ voltios y ___ Amp?",
        "Las extensiones eléctricas están en buen estado, están encauchatadas y no está deteriorado su aislamiento?",
        "La iluminación de emergencia en el área esta funcionando correctamente?",
        "Todas las herramientas eléctricas fueron inspeccionadas antes del uso con relación a su carcasa y conexión eléctrica?",
        "La subestación dispone de diagrama unificado, mapa de riesgo y esquema de comando?",
        "Los ejecutores están portando el kit de conexiones a tierra, detector de tensión sin contacto mecánico, bastones?",
        "Se ha establecido el uso y se dispone de tapetes dieléctricos por toda la extensión en toda el área de operación, los paneles de comando de subestación y la cabina primaria?",
        "Los materiales, herramientas y equipos cumplen y tiene visible la referencia a las normas técnicas aplicables?",
        "Se tiene establecido y se dispone de vestimenta especial para ser usada en trabajos próximos a circuitos energizados?",
        "Todos los accesorios metálicos de uso personal de los ejecutores del trabajo, les fueron retirados?"
      ]
    },
    frio: {
      titulo: "6. TRABAJOS SOBRE RED DE FRÍO / FREÓN, GLICOL, NH3",
      items: [
        "La red de frío/freón, glicol o NH3 fue aislada, drenada y presurizada controladamente antes de intervenirla?",
        "El personal dispone de los EPP específicos para la manipulación de refrigerantes/NH3?",
        "Fue realizada medición de presencia de NH3/freón en el área antes y durante el trabajo?",
        "El personal conoce el procedimiento ante fugas o liberación accidental de refrigerante/NH3?"
      ]
    }
  }
};