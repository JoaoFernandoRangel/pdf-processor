import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const processPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let texto = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            texto += pageText + '\n';
        }

        const extrair = (regex, fallback = '') => {
            const match = texto.match(regex);
            return match ? match[1].trim() : fallback;
        };

        const nome = extrair(/Nome:\s*(.*?)\s{2,}/);
        const data = extrair(/Data da Operação\s*(\d{2}\/\d{2}\/\d{4})/);
        const cirurgia = extrair(/Operação Tipo:\s*(.*?)\s*Diagnóstico/);
        const idade = extrair(/IDADE\s*(\d+)/);
        const prec_cp = extrair(/PRECP\s*(\d+)/);
        const primeiro_cirurgiao = extrair(/Operador:\s*(.*?)\s*1º assistente/);
        const segundo_cirurgiao = extrair(/1º assistente:\s*(.*?)\s*2º assistente/);
        const primeiro_aux = extrair(/2º assistente\s*(.*?)\s*3º assistente/);
        const segundo_aux = extrair(/3º assistente\s*(.*?)\s*Instrumentador/);
        // const complicacao = extrair(/Acidente durante a operação:\s*(.*?)\n/);
        const complicacao = extrair(/Acidente durante a operação:\s*(.*?)(?:\s*DESCRIÇÃO DA OPERAÇÃO|$)/);


        // Campos que são vazios no Python
        const dataFinal = {
            nome,
            data,
            cirurgia,
            porte_cirurgico: '',
            grupo: '',
            subespecialidade: '',
            idade,
            sexo: '',
            prontuario: '',
            prec_cp,
            posto: '',
            estado_origem: '',
            primeiro_cirurgiao,
            segundo_cirurgiao,
            primeiro_aux,
            segundo_aux,
            complicacao,
            atbprofilaxia: '',
            internacao: '',
            alta: ''
        };

        return { success: true, data: dataFinal };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export default processPDF;
