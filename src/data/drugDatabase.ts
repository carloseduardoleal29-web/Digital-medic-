export interface DrugItem {
  id: string;
  name: string;
  presentation: string;
  dosage: string;
  instructions: string;
  specialty: string;
}

export const DEFAULT_DRUGS: Record<string, DrugItem[]> = {
  anestesia: [
    {
      id: "an-1",
      name: "Ketoprofeno 100mg",
      presentation: "Cápsulas / Ampollas",
      dosage: "100mg",
      instructions: "Tomar 1 cápsula vía oral cada 8 horas por 3 a 5 días con alimentos.",
      specialty: "anestesia"
    },
    {
      id: "an-2",
      name: "Cefadroxilo 500mg",
      presentation: "Cápsulas",
      dosage: "500mg",
      instructions: "Tomar 1 cápsula vía oral cada 12 horas por 7 días.",
      specialty: "anestesia"
    },
    {
      id: "an-3",
      name: "Dexketoprofeno 25mg",
      presentation: "Comprimidos",
      dosage: "25mg",
      instructions: "Tomar 1 comprimido VO cada 8 horas si hay dolor moderado a severo.",
      specialty: "anestesia"
    },
    {
      id: "an-4",
      name: "Tramadol + Paracetamol (37.5mg / 325mg)",
      presentation: "Tabletas",
      dosage: "1 tableta",
      instructions: "Tomar 1 tableta VO cada 8 horas condicionado a dolor severo.",
      specialty: "anestesia"
    },
    {
      id: "an-5",
      name: "Ondansetrón 8mg",
      presentation: "Comprimidos bucodispersables",
      dosage: "8mg",
      instructions: "Disolver 1 comprimido sobre la lengua cada 8 a 12 horas si presenta náuseas.",
      specialty: "anestesia"
    }
  ],
  gastroenterologia: [
    {
      id: "gas-1",
      name: "Omeprazol 20mg",
      presentation: "Cápsulas con gránulos con cubierta entérica",
      dosage: "20mg",
      instructions: "Tomar 1 cápsula VO en ayunas, 30 minutos antes del desayuno por 28 días.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-2",
      name: "Esomeprazol 40mg",
      presentation: "Comprimidos con recubrimiento entérico",
      dosage: "40mg",
      instructions: "Tomar 1 comprimido diario en ayunas 30 min antes del desayuno por 4 a 8 semanas.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-3",
      name: "Pantoprazol 40mg",
      presentation: "Comprimidos gastrorresistentes",
      dosage: "40mg",
      instructions: "Tomar 1 comprimido diario en ayunas por 4 semanas.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-4",
      name: "Dexlansoprazol 60mg",
      presentation: "Cápsulas de liberación retardada dual",
      dosage: "60mg",
      instructions: "Tomar 1 cápsula al día con o sin alimentos por 4 a 8 semanas.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-5",
      name: "Lansoprazol 30mg",
      presentation: "Cápsulas con microgránulos entéricos",
      dosage: "30mg",
      instructions: "Tomar 1 cápsula VO en ayunas por 28 días.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-6",
      name: "Famotidina 40mg",
      presentation: "Comprimidos recubiertos",
      dosage: "40mg",
      instructions: "Tomar 1 comprimido en la noche antes de dormir.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-7",
      name: "Magaldrato + Simeticona (800mg / 100mg)",
      presentation: "Suspensión oral en gel (Frasco / Sachets)",
      dosage: "10ml - 1 sachet",
      instructions: "Tomar 1 sobre o cucharada 1 hora después de las comidas y al acostarse.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-8",
      name: "Sucralfato 1g / 5ml",
      presentation: "Suspensión oral",
      dosage: "1g (5ml)",
      instructions: "Tomar 5ml VO con el estómago vacío 1 hora antes de cada comida y al acostarse.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-9",
      name: "Subsalicilato de Bismuto 262mg",
      presentation: "Tabletas masticables / Suspensión",
      dosage: "2 tabletas o 15ml",
      instructions: "Tomar 2 tabletas cada 6 a 8 horas con abundante agua.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-10",
      name: "Domperidona 10mg",
      presentation: "Tabletas",
      dosage: "10mg",
      instructions: "Tomar 1 tableta VO 15 a 30 minutos antes de cada comida principal (3 veces al día).",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-11",
      name: "Metoclopramida 10mg",
      presentation: "Comprimidos",
      dosage: "10mg",
      instructions: "Tomar 1 comprimido 30 minutos antes de las comidas (máximo 5 días).",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-12",
      name: "Cinitaprida 1mg",
      presentation: "Comprimidos",
      dosage: "1mg",
      instructions: "Tomar 1 comprimido 15 minutos antes del desayuno, almuerzo y cena.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-13",
      name: "Levosulpirida 25mg",
      presentation: "Comprimidos",
      dosage: "25mg",
      instructions: "Tomar 1 comprimido 20 minutos antes de las comidas principales.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-14",
      name: "Trimebutina Maleato 200mg",
      presentation: "Comprimidos",
      dosage: "200mg",
      instructions: "Tomar 1 comprimido cada 8 horas 20 minutos antes de las comidas por 14 a 30 días.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-15",
      name: "Trimebutina 300mg Liberación Prolongada",
      presentation: "Cápsulas LP",
      dosage: "300mg",
      instructions: "Tomar 1 cápsula cada 12 horas o 1 diaria en ayunas.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-16",
      name: "Bromuro de Pinaverio 100mg",
      presentation: "Comprimidos recubiertos",
      dosage: "100mg",
      instructions: "Tomar 1 comprimido cada 12 horas con un vaso lleno de agua durante las comidas.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-17",
      name: "Otilonio Bromuro 40mg",
      presentation: "Comprimidos recubiertos",
      dosage: "40mg",
      instructions: "Tomar 1 comprimido cada 8 a 12 horas unos 20 minutos antes de las comidas.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-18",
      name: "Mebeverina Clorhidrato 200mg LP",
      presentation: "Cápsulas de liberación modificada",
      dosage: "200mg",
      instructions: "Tomar 1 cápsula 2 veces al día (mañana y noche) 20 min antes de comer.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-19",
      name: "Hioscina Butilbromuro 10mg (Buscapina)",
      presentation: "Grageas",
      dosage: "10mg a 20mg",
      instructions: "Tomar 1 a 2 grageas cada 8 horas si presenta cólico abdominal moderado.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-20",
      name: "Hioscina + Paracetamol (10mg / 500mg)",
      presentation: "Tabletas recubiertas",
      dosage: "1 tableta",
      instructions: "Tomar 1 tableta cada 8 horas condicionado a dolor o espasmo abdominal.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-21",
      name: "Esquema Triple H. Pylori (Esomeprazol + Claritromicina + Amoxicilina)",
      presentation: "Pack de erradicación",
      dosage: "Esomeprazol 40mg + Claritromicina 500mg + Amoxicilina 1g",
      instructions: "Tomar cada 12 horas (mañana y noche) rigurosamente durante 14 días continuos.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-22",
      name: "Mesalazina 500mg / 1g",
      presentation: "Comprimidos gastrorresistentes",
      dosage: "1g a 2g",
      instructions: "Tomar según pauta de inducción/mantenimiento con las comidas principales.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-23",
      name: "Mesalazina Enema 4g / 100ml",
      presentation: "Suspensión rectal",
      dosage: "4g",
      instructions: "Aplicar 1 enema rectal al acostarse y retener durante la noche.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-24",
      name: "Budesonida 3mg Entérica",
      presentation: "Cápsulas duras gastrorresistentes",
      dosage: "3mg (hasta 9mg/día)",
      instructions: "Tomar 3 cápsulas (9mg) juntas por la mañana 30 minutos antes del desayuno.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-25",
      name: "Polietilenglicol (PEG 3350)",
      presentation: "Sobres de 17g para reconstituir",
      dosage: "17g",
      instructions: "Disolver 1 sobre en 240ml de agua o jugo y tomar en la mañana a diario.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-26",
      name: "Lactulosa 66.7%",
      presentation: "Jarabe oral",
      dosage: "15ml a 30ml",
      instructions: "Tomar 15 a 30ml diarios con el desayuno. Ajustar dosis según consistencia.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-27",
      name: "Picosulfato Sódico 7.5mg/ml",
      presentation: "Gotas orales",
      dosage: "10 a 15 gotas",
      instructions: "Tomar 10 a 15 gotas por la noche antes de dormir con agua.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-28",
      name: "Plantago Ovata (Psyllium husk) 3.5g",
      presentation: "Sobres efervescentes / Polvo",
      dosage: "1 sobre",
      instructions: "Disolver en un vaso grande de agua e ingerir inmediatamente, seguido de otro vaso de agua.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-29",
      name: "Racecadotrilo 100mg",
      presentation: "Cápsulas",
      dosage: "100mg",
      instructions: "Tomar 1 cápsula inicial, luego 1 cápsula cada 8 horas antes de comer hasta ceder diarrea.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-30",
      name: "Loperamida 2mg",
      presentation: "Comprimidos",
      dosage: "2mg",
      instructions: "Tomar 2 comprimidos de inicio y 1 comprimido tras cada evacuación líquida (máx 8mg/día).",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-31",
      name: "Saccharomyces boulardii 250mg (Floratil)",
      presentation: "Cápsulas / Sobres de polvo liofilizado",
      dosage: "250mg",
      instructions: "Tomar 1 cápsula o sobre cada 12 horas lejos de antibióticos por 5 a 7 días.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-32",
      name: "Ácido Ursodesoxicólico (UDCA) 250mg / 300mg",
      presentation: "Cápsulas",
      dosage: "250mg - 500mg",
      instructions: "Tomar con la cena o repartido con las comidas principales con leche o alimentos.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-33",
      name: "Pancreatina (Lipasa 10.000 UI - Creon)",
      presentation: "Cápsulas con microgránulos gastrorresistentes",
      dosage: "1 a 2 cápsulas",
      instructions: "Tomar 1 a 2 cápsulas con cada comida principal y colación, sin masticar.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-34",
      name: "Pancreatina de Alta Potencia (Lipasa 25.000 UI)",
      presentation: "Cápsulas gastrorresistentes",
      dosage: "1 cápsula",
      instructions: "Tomar 1 cápsula durante cada comida copiosa con abundante líquido.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-35",
      name: "Silimarina (Cardo Mariano) 140mg",
      presentation: "Cápsulas",
      dosage: "140mg",
      instructions: "Tomar 1 cápsula 3 veces al día después de las comidas por 1 a 3 meses.",
      specialty: "gastroenterologia"
    },
    {
      id: "gas-36",
      name: "Ondansetrón 8mg Bucodispersable",
      presentation: "Comprimidos orodispersables",
      dosage: "8mg",
      instructions: "Colocar 1 comprimido sobre la lengua cada 8 horas si presenta náuseas intensas.",
      specialty: "gastroenterologia"
    }
  ],
  cardiologia: [
    {
      id: "car-1",
      name: "Losartán Potásico 50mg",
      presentation: "Tabletas recubiertas",
      dosage: "50mg",
      instructions: "Tomar 1 tableta VO a las 8:00 AM todos los días. Monitorear cifras tensionales.",
      specialty: "cardiologia"
    },
    {
      id: "car-2",
      name: "Amlodipina 5mg",
      presentation: "Tabletas",
      dosage: "5mg",
      instructions: "Tomar 1 tableta VO al día con el desayuno.",
      specialty: "cardiologia"
    },
    {
      id: "car-3",
      name: "Bisoprolol 2.5mg",
      presentation: "Comprimidos",
      dosage: "2.5mg",
      instructions: "Tomar 1 comprimido VO en la mañana. Controlar pulso cardíaco.",
      specialty: "cardiologia"
    },
    {
      id: "car-4",
      name: "Atorvastatina 20mg",
      presentation: "Tabletas",
      dosage: "20mg",
      instructions: "Tomar 1 tableta VO en la noche antes de dormir.",
      specialty: "cardiologia"
    },
    {
      id: "car-5",
      name: "Aspirina (Ácido Acetilsalicílico) 100mg",
      presentation: "Tabletas",
      dosage: "100mg",
      instructions: "Tomar 1 tableta VO diaria después del almuerzo.",
      specialty: "cardiologia"
    },
    {
      id: "car-6",
      name: "Aspirina Protect 100mg",
      presentation: "Comprimidos con cubierta entérica",
      dosage: "100mg",
      instructions: "Tomar 1 comprimido diario después del almuerzo con agua.",
      specialty: "cardiologia"
    },
    {
      id: "car-7",
      name: "Losartán Potásico 50mg",
      presentation: "Comprimidos recubiertos",
      dosage: "50mg",
      instructions: "Tomar 1 comprimido VO cada 12 o 24 horas según indicación médica.",
      specialty: "cardiologia"
    },
    {
      id: "car-8",
      name: "Enalapril 20mg",
      presentation: "Tabletas",
      dosage: "20mg",
      instructions: "Tomar 1 tableta VO cada 24 horas por la mañana.",
      specialty: "cardiologia"
    }
  ],
  general: [
    {
      id: "gen-asp-1",
      name: "Aspirina 500mg",
      presentation: "Tabletas efervescentes / Comprimidos",
      dosage: "500mg",
      instructions: "Tomar 1 tableta cada 8 horas con alimentos si hay dolor o malestar.",
      specialty: "general"
    },
    {
      id: "gen-asp-2",
      name: "Aspirina 100mg (Cardioprotectora)",
      presentation: "Tabletas",
      dosage: "100mg",
      instructions: "Tomar 1 tableta diaria después de la comida principal.",
      specialty: "general"
    },
    {
      id: "gen-1",
      name: "Acetaminofén (Paracetamol) 500mg",
      presentation: "Tabletas",
      dosage: "500mg",
      instructions: "Tomar 1 tableta VO cada 6 a 8 horas si presenta dolor o fiebre (máx 3g/día).",
      specialty: "general"
    },
    {
      id: "gen-1b",
      name: "Acetaminofén 1g",
      presentation: "Tabletas",
      dosage: "1g",
      instructions: "Tomar 1 tableta VO cada 8 horas condicionado a dolor moderado.",
      specialty: "general"
    },
    {
      id: "gen-2",
      name: "Ibuprofeno 400mg",
      presentation: "Tabletas recubiertas",
      dosage: "400mg",
      instructions: "Tomar 1 tableta VO cada 8 horas con las comidas durante 3 a 5 días.",
      specialty: "general"
    },
    {
      id: "gen-2b",
      name: "Ibuprofeno 600mg",
      presentation: "Tabletas",
      dosage: "600mg",
      instructions: "Tomar 1 tableta VO cada 8 horas después de las comidas.",
      specialty: "general"
    },
    {
      id: "gen-3",
      name: "Amoxicilina + Ácido Clavulánico (875mg / 125mg)",
      presentation: "Comprimidos",
      dosage: "1 comprimido",
      instructions: "Tomar 1 comprimido VO cada 12 horas con el inicio de las comidas por 7 a 10 días.",
      specialty: "general"
    },
    {
      id: "gen-3b",
      name: "Amoxicilina 500mg",
      presentation: "Cápsulas",
      dosage: "500mg",
      instructions: "Tomar 1 cápsula VO cada 8 horas por 7 días continuos.",
      specialty: "general"
    },
    {
      id: "gen-3c",
      name: "Azitromicina 500mg",
      presentation: "Tabletas recubiertas",
      dosage: "500mg",
      instructions: "Tomar 1 tableta VO diaria 1 hora antes o 2 horas después de alimentos por 3 a 5 días.",
      specialty: "general"
    },
    {
      id: "gen-3d",
      name: "Ciprofloxacina 500mg",
      presentation: "Comprimidos recubiertos",
      dosage: "500mg",
      instructions: "Tomar 1 comprimido VO cada 12 horas con abundante agua por 7 días.",
      specialty: "general"
    },
    {
      id: "gen-4",
      name: "Loratadina 10mg",
      presentation: "Tabletas",
      dosage: "10mg",
      instructions: "Tomar 1 tableta VO cada 24 horas en la noche por 7 días.",
      specialty: "general"
    },
    {
      id: "gen-4b",
      name: "Cetirizina 10mg",
      presentation: "Tabletas recubiertas",
      dosage: "10mg",
      instructions: "Tomar 1 tableta diaria en la noche.",
      specialty: "general"
    },
    {
      id: "gen-5",
      name: "Complejo B (Neurobión)",
      presentation: "Grageas",
      dosage: "1 gragea",
      instructions: "Tomar 1 gragea VO con el desayuno diariamente por 30 días.",
      specialty: "general"
    }
  ],
  ginecologia: [
    {
      id: "gin-1",
      name: "Clotrimazol 500mg",
      presentation: "Óvulo vaginal",
      dosage: "500mg",
      instructions: "Aplicar 1 óvulo por vía vaginal profundo por la noche antes de acostarse (dosis única).",
      specialty: "ginecologia"
    },
    {
      id: "gin-2",
      name: "Ácido Fólico 5mg",
      presentation: "Tabletas",
      dosage: "5mg",
      instructions: "Tomar 1 tableta VO al día con un vaso de agua o jugo cítrico.",
      specialty: "ginecologia"
    },
    {
      id: "gin-3",
      name: "Hierro Aminoquelado + Vitamina C",
      presentation: "Cápsulas",
      dosage: "1 cápsula",
      instructions: "Tomar 1 cápsula VO al día alejada de lácteos y café.",
      specialty: "ginecologia"
    },
    {
      id: "gin-4",
      name: "Metronidazol 500mg",
      presentation: "Óvulos vaginales / Tabletas",
      dosage: "500mg",
      instructions: "Colocar 1 óvulo vaginal por la noche durante 7 días continuos.",
      specialty: "ginecologia"
    }
  ],
  pediatria: [
    {
      id: "ped-1",
      name: "Acetaminofén Jarabe 120mg/5ml",
      presentation: "Frasco solución oral",
      dosage: "15mg/kg/dosis",
      instructions: "Administrar vía oral cada 6 horas en caso de fiebre superior a 38.3°C o dolor.",
      specialty: "pediatria"
    },
    {
      id: "ped-2",
      name: "Ibuprofeno Jarabe 100mg/5ml",
      presentation: "Suspensión oral",
      dosage: "10mg/kg/dosis",
      instructions: "Administrar vía oral cada 8 horas con los alimentos por 3 días.",
      specialty: "pediatria"
    },
    {
      id: "ped-3",
      name: "Suero Oral (Sales de Rehidratación Oral 75 mmol/L)",
      presentation: "Sobres para reconstituir en 1L de agua hervida",
      dosage: "A libre demanda",
      instructions: "Ofrecer a cucharaditas o sorbos pequeños después de cada deposición líquida o vómito.",
      specialty: "pediatria"
    },
    {
      id: "ped-4",
      name: "Desloratadina Jarabe 0.5mg/ml",
      presentation: "Jarabe pediátrico",
      dosage: "2.5ml",
      instructions: "Administrar 2.5ml vía oral una vez al día en la noche por 5 días.",
      specialty: "pediatria"
    }
  ],
  traumatologia: [
    {
      id: "tra-1",
      name: "Meloxicam 15mg",
      presentation: "Tabletas",
      dosage: "15mg",
      instructions: "Tomar 1 tableta VO diaria con el almuerzo durante 7 a 10 días.",
      specialty: "traumatologia"
    },
    {
      id: "tra-2",
      name: "Colágeno Hidrolizado + Vitamina D3",
      presentation: "Sobres en polvo",
      dosage: "1 sobre",
      instructions: "Disolver 1 sobre en 200ml de agua y tomar en ayunas cada mañana.",
      specialty: "traumatologia"
    },
    {
      id: "tra-3",
      name: "Tiocolchicósido 4mg (Relajante Muscular)",
      presentation: "Cápsulas",
      dosage: "4mg",
      instructions: "Tomar 1 cápsula VO cada 12 horas por 5 días.",
      specialty: "traumatologia"
    }
  ],
  respiratorio: [
    {
      id: "res-1",
      name: "Salbutamol Inhalador 100mcg",
      presentation: "Aerosol presurizado",
      dosage: "2 disparos (puffs)",
      instructions: "Inhalar 2 disparos con aerocámara cada 6 a 8 horas si hay dificultad respiratoria o sibilancias.",
      specialty: "respiratorio"
    },
    {
      id: "res-2",
      name: "Budesonida Inhalador 200mcg",
      presentation: "Aerosol",
      dosage: "1 a 2 inhalaciones",
      instructions: "Inhalar 1 descarga cada 12 horas. Enjuagar la boca con agua tras su aplicación.",
      specialty: "respiratorio"
    },
    {
      id: "res-3",
      name: "N-Acetilcisteína 600mg",
      presentation: "Comprimidos efervescentes",
      dosage: "600mg",
      instructions: "Disolver 1 comprimido en medio vaso de agua y tomar una vez al día por 7 días.",
      specialty: "respiratorio"
    }
  ],
  psicologia: [
    {
      id: "psi-1",
      name: "Sertralina 50mg",
      presentation: "Comprimidos recubiertos",
      dosage: "50mg",
      instructions: "Tomar 1 comprimido vía oral cada mañana después del desayuno. No suspender bruscamente.",
      specialty: "psicologia"
    },
    {
      id: "psi-2",
      name: "Escitalopram 10mg",
      presentation: "Comprimidos ranurados",
      dosage: "10mg",
      instructions: "Tomar 1 comprimido diario por las mañanas (o noches) con alimentos.",
      specialty: "psicologia"
    },
    {
      id: "psi-3",
      name: "Clonazepam 0.5mg / 2mg",
      presentation: "Comprimidos / Gotas orales (2.5mg/ml)",
      dosage: "0.5mg",
      instructions: "Tomar según indicación médica antes de acostarse para control de ansiedad o insomnio.",
      specialty: "psicologia"
    },
    {
      id: "psi-4",
      name: "Alprazolam 0.5mg",
      presentation: "Tabletas ranuradas",
      dosage: "0.5mg",
      instructions: "Tomar medio a 1 comprimido VO en momentos de crisis de angustia o pánico bajo supervisión.",
      specialty: "psicologia"
    },
    {
      id: "psi-5",
      name: "Fluoxetina 20mg",
      presentation: "Cápsulas",
      dosage: "20mg",
      instructions: "Tomar 1 cápsula por la mañana con el desayuno.",
      specialty: "psicologia"
    },
    {
      id: "psi-6",
      name: "Duloxetina 30mg / 60mg",
      presentation: "Cápsulas con gránulos gastrorresistentes",
      dosage: "30mg a 60mg",
      instructions: "Tomar 1 cápsula diaria con alimentos por la mañana.",
      specialty: "psicologia"
    },
    {
      id: "psi-7",
      name: "Pregabalina 75mg / 150mg",
      presentation: "Cápsulas",
      dosage: "75mg",
      instructions: "Tomar 1 cápsula por la noche antes de dormir.",
      specialty: "psicologia"
    },
    {
      id: "psi-8",
      name: "Quetiapina 25mg / 100mg",
      presentation: "Comprimidos recubiertos",
      dosage: "25mg",
      instructions: "Tomar 1 comprimido por la noche, 30 minutos antes de dormir.",
      specialty: "psicologia"
    },
    {
      id: "psi-9",
      name: "Zolpidem 10mg",
      presentation: "Comprimidos recubiertos",
      dosage: "10mg",
      instructions: "Tomar 1 comprimido inmediatamente antes de acostarse. No consumir con alcohol.",
      specialty: "psicologia"
    },
    {
      id: "psi-10",
      name: "Melatonina 3mg / 5mg + Vitamina B6",
      presentation: "Comprimidos / Gomitas sublinguales",
      dosage: "1 dosis (3mg a 5mg)",
      instructions: "Tomar o disolver 30 a 45 minutos antes de dormir en ambiente oscuro.",
      specialty: "psicologia"
    },
    {
      id: "psi-11",
      name: "Valeriana + Pasiflora + Toronjil",
      presentation: "Cápsulas fitoterapéuticas / Gotas",
      dosage: "1 a 2 cápsulas",
      instructions: "Tomar 1 a 2 cápsulas 1 hora antes de dormir o cada 12 horas en períodos de estrés.",
      specialty: "psicologia"
    },
    {
      id: "psi-12",
      name: "Complejo B Neurotropo (B1, B6, B12)",
      presentation: "Grageas / Ampollas IM",
      dosage: "1 gragea",
      instructions: "Tomar 1 gragea diaria con el almuerzo como soporte neuromuscular.",
      specialty: "psicologia"
    }
  ]
};

export const SPECIALTY_LABELS: Record<string, string> = {
  anestesia: "Anestesiología y Cirugía",
  gastroenterologia: "Gastroenterología",
  cardiologia: "Cardiología",
  general: "Medicina General e Interna",
  psicologia: "Psicología, Psiquiatría y Salud Mental",
  ginecologia: "Ginecología y Obstetricia",
  pediatria: "Pediatría",
  traumatologia: "Traumatología y Ortopedia",
  respiratorio: "Neumonología y Vías Respiratorias"
};

/**
 * Obtener todos los fármacos del sistema integrando todas las especialidades y fármacos personalizados
 */
export const getAllDrugs = (customDrugs: DrugItem[] = []): DrugItem[] => {
  const allDefault: DrugItem[] = Object.values(DEFAULT_DRUGS).flat();
  return [...customDrugs, ...allDefault];
};

/**
 * Búsqueda rápida instantánea e inteligente de fármacos (ej: "aspi" -> Aspirina, etc.)
 */
export const searchDrugs = (query: string, customDrugs: DrugItem[] = []): DrugItem[] => {
  const clean = query.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!clean) return [];

  const all = getAllDrugs(customDrugs);
  return all.filter((d) => {
    const nameNorm = d.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const presNorm = d.presentation.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return nameNorm.includes(clean) || presNorm.includes(clean);
  });
};

