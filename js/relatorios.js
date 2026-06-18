import {
    db,
    collection,
    getDocs
} from "./firebase.js";

import {
    formatarData
} from "./utils.js";

document.addEventListener(
    "DOMContentLoaded",
    () => {

        configurarRelatorios();

    }
);

function configurarRelatorios() {

    const btnRemessas =
        document.getElementById(
            "btnRelatorioRemessas"
        );

    const btnVolumes =
        document.getElementById(
            "btnRelatorioVolumes"
        );

    const btnDescarte =
        document.getElementById(
            "btnRelatorioDescarte"
        );

    const btnAuditoria =
        document.getElementById(
            "btnRelatorioAuditoria"
        );

    if (btnRemessas)
        btnRemessas.addEventListener(
            "click",
            gerarRelatorioRemessas
        );

    if (btnVolumes)
        btnVolumes.addEventListener(
            "click",
            gerarRelatorioVolumes
        );

    if (btnDescarte)
        btnDescarte.addEventListener(
            "click",
            gerarRelatorioDescartes
        );

    if (btnAuditoria)
        btnAuditoria.addEventListener(
            "click",
            gerarRelatorioAuditoria
        );

}

async function gerarRelatorioRemessas() {

    const snap =
        await getDocs(
            collection(
                db,
                "remessas"
            )
        );

    const { jsPDF } =
        window.jspdf;

    const pdf =
        new jsPDF();

    let y = 20;

    pdf.setFontSize(18);

    pdf.text(
        "Relatório de Remessas",
        14,
        y
    );

    y += 15;

    snap.forEach((doc) => {

        const r =
            doc.data();

        pdf.setFontSize(10);

        pdf.text(
            `${r.remessaId} | ${r.origem} → ${r.destino}`,
            14,
            y
        );

        y += 8;

        if (y > 270) {

            pdf.addPage();

            y = 20;

        }

    });

    pdf.save(
        "relatorio-remessas.pdf"
    );

}

async function gerarRelatorioVolumes() {

    const snap =
        await getDocs(
            collection(
                db,
                "volumes"
            )
        );

    const { jsPDF } =
        window.jspdf;

    const pdf =
        new jsPDF();

    let y = 20;

    pdf.setFontSize(18);

    pdf.text(
        "Relatório de Volumes",
        14,
        y
    );

    y += 15;

    snap.forEach((doc) => {

        const v =
            doc.data();

        pdf.setFontSize(10);

        pdf.text(
            `${v.codigo} | ${v.status}`,
            14,
            y
        );

        y += 8;

        if (y > 270) {

            pdf.addPage();

            y = 20;

        }

    });

    pdf.save(
        "relatorio-volumes.pdf"
    );

}

async function gerarRelatorioDescartes() {

    const snap =
        await getDocs(
            collection(
                db,
                "volumes"
            )
        );

    const { jsPDF } =
        window.jspdf;

    const pdf =
        new jsPDF();

    let y = 20;

    pdf.setFontSize(18);

    pdf.text(
        "Relatório de Descartes",
        14,
        y
    );

    y += 15;

    snap.forEach((doc) => {

        const v =
            doc.data();

        if (
            v.status !==
            "DESCARTADO"
        ) return;

        pdf.setFontSize(10);

        pdf.text(
            `${v.codigo} | ${v.motivoDescarte || "-"}`,
            14,
            y
        );

        y += 8;

        if (y > 270) {

            pdf.addPage();

            y = 20;

        }

    });

    pdf.save(
        "relatorio-descartes.pdf"
    );

}

async function gerarRelatorioAuditoria() {

    const snap =
        await getDocs(
            collection(
                db,
                "auditoria"
            )
        );

    const { jsPDF } =
        window.jspdf;

    const pdf =
        new jsPDF();

    let y = 20;

    pdf.setFontSize(18);

    pdf.text(
        "Relatório de Auditoria",
        14,
        y
    );

    y += 15;

    snap.forEach((doc) => {

        const a =
            doc.data();

        pdf.setFontSize(10);

        pdf.text(
            `${formatarData(a.data)} | ${a.acao}`,
            14,
            y
        );

        y += 8;

        if (y > 270) {

            pdf.addPage();

            y = 20;

        }

    });

    pdf.save(
        "relatorio-auditoria.pdf"
    );

}
