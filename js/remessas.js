import {
    db,
    collection,
    addDoc,
    getDocs
} from "./firebase.js";

import {
    gerarRemessaId,
    gerarVolumeCodigo,
    mostrarToast
} from "./utils.js";

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "formRemessa"
            );

        if (form) {

            form.addEventListener(
                "submit",
                criarRemessa
            );

        }

    }
);

async function criarRemessa(e) {

    e.preventDefault();

    try {

        const origem =
            document
                .getElementById(
                    "origem"
                )
                .value
                .trim();

        const destino =
            document
                .getElementById(
                    "destino"
                )
                .value
                .trim();

        const cidade =
            document
                .getElementById(
                    "cidade"
                )
                .value
                .trim();

        const material =
            document
                .getElementById(
                    "material"
                )
                .value
                .trim();

        const responsavel =
            document
                .getElementById(
                    "responsavel"
                )
                .value
                .trim();

        const quantidade =
            parseInt(
                document
                    .getElementById(
                        "quantidadeVolumes"
                    )
                    .value
            );

        if (
            !origem ||
            !destino ||
            !cidade ||
            !material ||
            !responsavel ||
            !quantidade
        ) {

            mostrarToast(
                "Preencha todos os campos.",
                "danger"
            );

            return;

        }

        const remessaId =
            gerarRemessaId();

        await addDoc(
            collection(
                db,
                "remessas"
            ),
            {
                remessaId,
                origem,
                destino,
                cidade,
                material,
                responsavel,
                quantidade,
                criadoEm:
                    Date.now()
            }
        );

        for (
            let i = 1;
            i <= quantidade;
            i++
        ) {

            await addDoc(
                collection(
                    db,
                    "volumes"
                ),
                {
                    remessaId,

                    codigo:
                        gerarVolumeCodigo(
                            remessaId,
                            i
                        ),

                    numero: i,

                    origem,
                    destino,
                    cidade,
                    material,
                    responsavel,

                    status:
                        "AGUARDANDO",

                    criadoEm:
                        Date.now(),

                    saidaEm:
                        null,

                    chegadaEm:
                        null,

                    descarteEm:
                        null
                }
            );

        }

        mostrarToast(
            "Remessa criada com sucesso.",
            "success"
        );

        document
            .getElementById(
                "formRemessa"
            )
            .reset();

        await carregarEtiquetas(
            remessaId
        );

    } catch (erro) {

        console.error(
            erro
        );

        mostrarToast(
            "Erro ao criar remessa.",
            "danger"
        );

    }

}

async function carregarEtiquetas(
    remessaId
) {

    const container =
        document.getElementById(
            "etiquetasContainer"
        );

    if (!container)
        return;

    container.innerHTML =
        "<h4>Gerando etiquetas...</h4>";

    const volumes =
        await getDocs(
            collection(
                db,
                "volumes"
            )
        );

    container.innerHTML = "";

    volumes.forEach(
        (doc) => {

            const v =
                doc.data();

            if (
                v.remessaId !==
                remessaId
            )
                return;

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "etiqueta-card";

            div.innerHTML = `
                <h4>${v.codigo}</h4>
                <p>${v.material}</p>
                <p>${v.origem}</p>
                <p>${v.destino}</p>
                <canvas id="qr-${doc.id}"></canvas>
            `;

            container.appendChild(
                div
            );

            const canvas =
                div.querySelector(
                    "canvas"
                );

            QRCode.toCanvas(
                canvas,
                v.codigo,
                {
                    width: 160
                }
            );

        }
    );

}
