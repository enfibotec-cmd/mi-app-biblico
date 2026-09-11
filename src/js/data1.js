/* ============================================================
   DATOS: muestra representativa de la Biblia
   En producción, reemplaza por JSON completo.
   ============================================================ */
const BIBLIA = {
  "Génesis": { 1: { 1: "En el principio creó Dios los cielos y la tierra." } },
  "Éxodo": { 15: { 2: "Jehová es mi fuerza y mi cántico, y ha sido mi salvación." } },
  "Levítico": { 19: { 18: "Amarás a tu prójimo como a ti mismo." } },
  "Números": { 6: { 24: "Jehová te bendiga y te guarde." } },
  "Deuteronomio": { 6: { 5: "Amarás a Jehová tu Dios con todo tu corazón." } },
  "Josué": { 1: { 9: "Mira que te mando que te esfuerces y seas valiente." } },
  "Jueces": { 6: { 12: "Jehová está contigo, varón esforzado y valiente." } },
  "Rut": { 1: { 16: "Donde tú vayas, iré yo; y donde tú vivas, viviré yo." } },
  "1 Samuel": { 16: { 7: "Jehová mira el corazón." } },
  "2 Samuel": { 22: { 3: "Escudo mío eres, y el cuerno de mi salvación." } },
  "1 Reyes": { 3: { 9: "Da, pues, a tu siervo corazón entendido." } },
  "2 Reyes": { 19: { 19: "Ahora pues, Jehová Dios nuestro, sálvanos de su mano." } },
  "1 Crónicas": { 16: { 34: "Dad gracias a Jehová, porque él es bueno." } },
  "2 Crónicas": { 7: { 14: "Si se humillare mi pueblo... yo oiré desde los cielos." } },
  "Esdras": { 3: { 11: "Porque él es bueno, porque su misericordia es eterna." } },
  "Nehemías": { 8: { 10: "El gozo de Jehová es vuestra fuerza." } },
  "Ester": { 4: { 14: "¿Y quién sabe si para esta hora has llegado al reino?" } },
  "Job": { 19: { 25: "Yo sé que mi Redentor vive." } },
  "Salmos": {
    23: { 1: "Jehová es mi pastor, nada me faltará." },
    91: { 1: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente." },
    119: { 105: "Lámpara es a mis pies tu palabra." }
  },
  "Proverbios": { 3: { 5: "Fíate de Jehová de todo tu corazón." } },
  "Eclesiastés": { 3: { 1: "Todo tiene su tiempo, y todo lo que se quiere debajo del cielo tiene su hora." } },
  "Cantares": { 2: { 4: "Su bandera sobre mí es amor." } },
  "Isaías": {
    40: { 31: "Los que esperan a Jehová tendrán nuevas fuerzas." },
    41: { 10: "No temas, porque yo estoy contigo." }
  },
  "Jeremías": { 29: { 11: "Yo sé los pensamientos que tengo acerca de vosotros, pensamientos de paz." } },
  "Lamentaciones": { 3: { 22: "Por la misericordia de Jehová no hemos sido consumidos." } },
  "Ezequiel": { 37: { 14: "Y pondré mi Espíritu en vosotros, y viviréis." } },
  "Daniel": { 3: { 17: "He aquí nuestro Dios a quien servimos puede librarnos." } },
  "Oseas": { 6: { 3: "Conoceremos, y proseguiremos en conocer a Jehová." } },
  "Joel": { 2: { 13: "Rasgad vuestro corazón, y no vuestros vestidos." } },
  "Amós": { 5: { 24: "Pero corra el juicio como las aguas, y la justicia como arroyo impetuoso." } },
  "Abdías": { 1: { 4: "Aunque te remontes como águila, de allí serás derribado." } },
  "Jonás": { 2: { 2: "Clamé en mi angustia a Jehová, y él me oyó." } },
  "Miqueas": { 6: { 8: "Hacer justicia, y amar misericordia, y humillarte ante tu Dios." } },
  "Nahúm": { 1: { 7: "Jehová es bueno, fortaleza en el día de la angustia." } },
  "Habacuc": { 2: { 4: "El justo por su fe vivirá." } },
  "Sofonías": { 3: { 17: "Jehová está en medio de ti, poderoso, él salvará." } },
  "Hageo": { 2: { 9: "La gloria postrera de esta casa será mayor que la primera." } },
  "Zacarías": { 4: { 6: "No con ejército, ni con fuerza, sino con mi Espíritu." } },
  "Malaquías": { 3: { 10: "Probadme ahora en esto, dice Jehová de los ejércitos." } },
  "Mateo": {
    5: { 16: "Así alumbre vuestra luz delante de los hombres." },
    6: { 33: "Buscad primeramente el reino de Dios y su justicia." },
    11: { 28: "Venid a mí todos los que estáis trabajados y cargados." },
    28: { 19: "Id, y haced discípulos a todas las naciones." }
  },
  "Marcos": { 10: { 27: "Para Dios todas las cosas son posibles." } },
  "Lucas": {
    6: { 31: "Como queréis que hagan los hombres con vosotros, así haced vosotros con ellos." },
    11: { 9: "Pedid, y se os dará; buscad, y hallaréis." }
  },
  "Juan": {
    3: { 16: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito." },
    8: { 32: "Y conoceréis la verdad, y la verdad os hará libres." },
    14: { 6: "Yo soy el camino, la verdad y la vida.", 27: "La paz os dejo, mi paz os doy." }
  },
  "Hechos": { 1: { 8: "Recibiréis poder, cuando haya venido sobre vosotros el Espíritu Santo." } },
  "Romanos": {
    8: { 28: "A los que aman a Dios, todas las cosas les ayudan a bien.",
         38: "Nada nos podrá separar del amor de Dios." },
    12: { 2: "Transformaos por medio de la renovación de vuestro entendimiento." }
  },
  "1 Corintios": {
    10: { 13: "Fiel es Dios, que no os dejará ser tentados." },
    13: { 4: "El amor es sufrido, es benigno." }
  },
  "2 Corintios": {
    5: { 17: "Si alguno está en Cristo, nueva criatura es." },
    12: { 9: "Bástate mi gracia; porque mi poder se perfecciona en la debilidad." }
  },
  "Gálatas": { 5: { 22: "El fruto del Espíritu es amor, gozo, paz..." } },
  "Efesios": {
    2: { 8: "Por gracia sois salvos por medio de la fe." },
    6: { 11: "Vestíos de toda la armadura de Dios." }
  },
  "Filipenses": { 4: { 6: "Por nada estéis afanosos.", 13: "Todo lo puedo en Cristo que me fortalece." } },
  "Colosenses": { 3: { 23: "Todo lo que hagáis, hacedlo de corazón." } },
  "1 Tesalonicenses": { 5: { 17: "Orad sin cesar." } },
  "2 Tesalonicenses": { 3: { 10: "Si alguno no quiere trabajar, tampoco coma." } },
  "1 Timoteo": { 4: { 12: "Sé ejemplo de los creyentes." } },
  "2 Timoteo": {
    1: { 7: "Dios nos ha dado espíritu de poder, de amor y de dominio propio." },
    3: { 16: "Toda la Escritura es inspirada por Dios." }
  },
  "Tito": { 2: { 11: "La gracia de Dios se ha manifestado para salvación." } },
  "Filemón": { 1: { 6: "La participación de tu fe sea eficaz." } },
  "Hebreos": {
    4: { 12: "La palabra de Dios es viva y eficaz." },
    11: { 1: "Es, pues, la fe la certeza de lo que se espera." },
    12: { 2: "Puestos los ojos en Jesús, el autor y consumador de la fe." }
  },
  "Santiago": {
    1: { 5: "Si alguno de vosotros tiene falta de sabiduría, pídala a Dios." },
    2: { 17: "La fe, si no tiene obras, es muerta en sí misma." }
  },
  "1 Pedro": { 5: { 7: "Echad toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros." } },
  "2 Pedro": { 3: { 9: "El Señor no retarda su promesa, sino que es paciente." } },
  "1 Juan": {
    1: { 9: "Si confesamos nuestros pecados, él es fiel y justo." },
    4: { 8: "Dios es amor." }
  },
  "2 Juan": { 1: { 4: "Me regocijé mucho... andando en la verdad." } },
  "3 Juan": { 1: { 4: "No tengo mayor gozo que oír que mis hijos andan en la verdad." } },
  "Judas": { 1: { 24: "A aquel que es poderoso para guardaros sin caída." } },
  "Apocalipsis": {
    3: { 20: "He aquí, yo estoy a la puerta y llamo." },
    21: { 4: "Enjugará Dios toda lágrima de los ojos de ellos." }
  }
};
