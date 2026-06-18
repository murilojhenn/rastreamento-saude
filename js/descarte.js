import {
    db,
    collection,
    getDocs,
    updateDoc,
    addDoc,
    doc
} from "./firebase.js";

import {
    mostrarToast
} from "./utils.js";

import {
    getUsuarioLogado
} from "./auth.js";

let leitorDescarte = null;

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const btnRegistrar =
            document.getElementById(
                "btnRegistrarDescarte"
            );

        const btnCamera =
            document.getElementById(
                "btnAbrirCameraDescarte"
            );

        if (btnRegistrar) {

            btnRegistrar.addEventListener(
                "click",
                registrarDescarteManual
            );

        }

        if (btnCamera) {

            btnCamera.addEventListener(
                "click",
                iniciarCameraDescarte
            );

        }

    }
);

async function registrarDescarteManual() {

    const codigo =
        document
            .getElementById(
                "codigoDescarte"
            )
            .value
            .trim();

    await registrarDescarte(
        codigo
    );

}

function converterImagemParaBase64(
    arquivo
) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload = () =>
                resolve(
                    reader.result
                );

            reader.onerror =
                reject;

            reader.readAsDataURL(
                arquivo
            );

        }
    );

}

async function registrarDescarte(
    codigo
) {

    const usuario =
        getUsuarioLogado();

    if (
        !usuario ||
        !["admin", "descarte"].includes(
            usuario.perfil
        )
    ) {

        mostrarToast(
            "Você não possui permissão para descarte.",
            "danger"
        );

        return;

    }

    const motivo =
        document
            .getElementById(
                "motivoDescarte"
            )
            .value;

    const observacao =
        document
            .getElementById(
                "observacaoDescarte"
            )
            .value
            .trim();

    const fotoInput =
        document.getElementById(
            "fotoDescarte"
        );

    const foto =
        fotoInput.files[0];

    if (!codigo) {

        mostrarToast(
            "Informe o código do volume.",
            "danger"
        );

        return;

    }

    if (!motivo) {

        mostrarToast(
            "Selecione o motivo do descarte.",
            "danger"
        );

        return;

    }

    if (!foto) {

        mostrarToast(
            "A foto do descarte é obrigatória.",
            "danger"
        );

        return;

    }

    try {

        const fotoBase64 =
            await converterImagemParaBase64(
                foto
            );

        const snap =
            await getDocs(
                collection(
                    db,
                    "volumes"
                )
            );

        let volume =
            null;

        snap.forEach((d) => {

            const dados =
                d.data();

            if (
                dados.codigo === codigo
            ) {

                volume = {
                    id: d.id,
                    ...dados
                };

            }

        });

        if (!volume) {

            mostrarToast(
                "Volume não encontrado.",
                "danger"
            );

            return;

        }

        if (
            volume.status ===
            "DESCARTADO"
        ) {

            mostrarToast(
                "Este volume já foi descartado.",
                "danger"
            );

            return;

        }

        const agora =
            Date.now();

        await updateDoc(
            doc(
                db,
                "volumes",
                volume.id
            ),
            {
                status:
                    "DESCARTADO",

                descarteEm:
                    agora,

                descartePor:
                    usuario.nome,

                descarteCodigoFuncionario:
                    usuario.codigoInterno || "-",

                motivoDescarte:
                    motivo,

                observacaoDescarte:
                    observacao,

                fotoDescarte:
                    fotoBase64
            }
        );

        await addDoc(
            collection(
                db,
                "movimentacoes"
            ),
            {
                tipo:
                    "DESCARTE",

                codigo:
                    volume.codigo,

                remessaId:
                    volume.remessaId,

                data:
                    agora,

                usuario:
                    usuario.nome,

                perfil:
                    usuario.perfil,

                codigoFuncionario:
                    usuario.codigoInterno || "-",

                motivo:
                    motivo
            }
        );

        await addDoc(
            collection(
                db,
                "auditoria"
            ),
            {
                data:
                    agora,

                usuario:
                    usuario.nome,

                perfil:
                    usuario.perfil,

                codigoFuncionario:
                    usuario.codigoInterno || "-",

                acao:
                    "REGISTRAR_DESCARTE",

                detalhes:
                    `Descarte registrado para ${volume.codigo}. Motivo: ${motivo}`
            }
        );

        document.getElementById(
            "codigoDescarte"
        ).value = "";

        document.getElementById(
            "motivoDescarte"
        ).value = "";

        document.getElementById(
            "observacaoDescarte"
        ).value = "";

        document.getElementById(
            "fotoDescarte"
        ).value = "";

        mostrarToast(
            "Descarte registrado com sucesso.",
            "success"
        );

    } catch (erro) {

        console.error(
            erro
        );

        mostrarToast(
            "Erro ao registrar descarte.",
            "danger"
        );

    }

}

async function iniciarCameraDescarte() {

    try {

        if (leitorDescarte) {

            await leitorDescarte.stop();

            leitorDescarte.clear();

        }

        leitorDescarte =
            new Html5Qrcode(
                "readerDescarte"
            );

        await leitorDescarte.start(
            {
                facingMode:
                    "environment"
            },
            {
                fps: 10,
                qrbox: 250
            },
            async (decodedText) => {

                document.getElementById(
                    "codigoDescarte"
                ).value =
                    decodedText;

                await leitorDescarte.stop();

                leitorDescarte.clear();

                leitorDescarte = null;

                mostrarToast(
                    "Código lido. Agora selecione a foto e registre.",
                    "info"
                );

            },
            () => {}
        );

    } catch (erro) {

        console.error(
            erro
        );

        mostrarToast(
            "Erro ao abrir câmera.",
            "danger"
        );

    }

}
