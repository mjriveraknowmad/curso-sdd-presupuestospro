Artículo: Checklist - Tests unitarios para tu especificación con SDD
En la clase anterior vimos por encima el comando /speckit-checklist dentro del ciclo de spec-driven development. Merece un artículo propio, porque es probablemente el comando peor entendido de todo Spec Kit… y uno de los más potentes cuando se usa bien.

Para qué sirve (y para qué NO sirve)
La documentación oficial lo describe con una metáfora brillante: los checklists son "unit tests for English", tests unitarios para requisitos escritos en lenguaje natural. Si tu spec es código escrito en español (o inglés), el checklist es su suite de tests.

Esto es lo importante: /speckit-checklist valida la calidad de tus requisitos, no el funcionamiento de tu implementación. No es una herramienta de QA. Compara:

Incorrecto: "Verificar que el botón responde al hacer clic" (eso es testear la implementación)

Correcto: "¿Están los requisitos de estados definidos de forma consistente para todos los elementos interactivos?" (eso es testear la spec)

Cada item del checklist evalúa los requisitos según dimensiones concretas: completitud (¿están todos los requisitos necesarios?), claridad (¿son inequívocos y específicos?), consistencia (¿se alinean entre sí?), medibilidad (¿se pueden verificar objetivamente?) y cobertura (¿están contemplados los casos límite?).

Cuándo es interesante utilizarlo
El quickstart oficial distingue dos caminos. Para experimentos rápidos basta el flujo mínimo: specify → plan → tasks → implement. Pero para features de producción o con ambigüedad significativa, /speckit-checklist se trata como un quality gate habitual, junto a clarify y analyze:

constitution → specify → clarify → plan → checklist → tasks → analyze → implement

En la práctica, brilla especialmente cuando:

La feature tiene mucha superficie de UX: pantallas, estados de carga, errores, interacciones. Es facilísimo que la spec diga "interfaz limpia e intuitiva" sin definir nada medible, y el checklist de UX lo destapa.

Hay dominios de riesgo: seguridad, API pública, rendimiento, accesibilidad. Puedes generar un checklist por dominio (ux.md, security.md, api.md) para la misma feature.

Vas a delegar la implementación al agente con alta autonomía (¿recuerdas el artículo sobre modos automáticos?). Cuanta menos supervisión durante la ejecución, más te interesa haber blindado la spec antes.

El coste de un malentendido es alto: cada ambigüedad que caza el checklist es una decisión que el agente NO tomará por su cuenta durante /speckit-implement.

No lo confundas con /speckit-analyze: ese comando comprueba la consistencia entre artefactos (spec vs plan vs tasks), mientras que checklist audita la calidad de los requisitos dentro de un dominio concreto. Son complementarios, no alternativos.

Cómo funciona
Se invoca con una descripción del dominio o del foco que te interesa. Ejemplos reales de uso:

/speckit-checklist ux


O con más contexto, que siempre da mejores resultados:

/speckit-checklist Crea un checklist de UX para el flujo de onboarding.
Foco en accesibilidad, estados de error y estados de carga.
Audiencia: revisor de PR.


El agente analiza tu petición, extrae señales (dominio, indicadores de riesgo, audiencia) y, si le falta información relevante, te hace alguna pregunta breve sobre el foco, la profundidad o el momento de uso antes de generar nada.

El resultado es un archivo en la carpeta de la feature activa:

specs/001-onboarding/checklists/ux.md


Con items numerados de forma incremental y etiquetados con su dimensión de calidad y su trazabilidad a la spec:

- [ ] CHK001 - ¿Están definidos los requisitos de jerarquía visual con criterios medibles? [Completeness, Spec §FR-001]
- [ ] CHK002 - ¿Está "carga rápida" cuantificado con umbrales de tiempo concretos? [Clarity, Spec §FR-004]
- [ ] CHK003 - ¿Existen requisitos de manejo de errores para todos los modos de fallo de la API? [Gap]
- [ ] CHK004 - ¿Puede verificarse objetivamente "peso visual equilibrado"? [Measurability, Spec §FR-002]


Fíjate en las etiquetas: [Gap] señala un requisito que directamente falta, [Clarity] uno ambiguo, [Measurability] uno que no se puede verificar. Cada ejecución del comando crea un archivo nuevo con nombre corto y descriptivo o, si ya existe, añade items al final continuando la numeración, nunca borra contenido previo.

Cerrando el ciclo: qué hacer con el checklist
Generar el checklist es la mitad del trabajo. El flujo completo es iterativo:

Revisa los items y localiza los [Gap], [Ambiguity] y [Clarity].

Corrige la spec (spec.md) para resolverlos. Si el plan ya existía, pide al agente que actualice el plan con los cambios en lugar de regenerarlo desde cero, o perderás el trabajo de revisión previo.

Marca los items resueltos y repite hasta que el checklist pase.

Solo entonces avanza a /speckit-tasks.

Un consejo del propio README de Spec Kit: usa esta interacción como oportunidad para clarificar y hacer preguntas sobre la especificación, no trates el primer intento del agente como definitivo.

En resumen
/speckit-checklist convierte la revisión de requisitos (esa tarea que todos decimos hacer y casi nadie hace con rigor) en un artefacto concreto, versionable y verificable.

En SDD, donde la spec es el contrato que el agente va a ejecutar, testear ese contrato antes de implementar es la inversión con mejor retorno de todo el ciclo.