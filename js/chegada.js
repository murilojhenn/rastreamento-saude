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

let leitorChegada = null;

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const btnRegistrar =
            document.getElementById(
                "btnRegistrarChegada"
            );

        const btnCamera =
            document.getElementById(
                "btnAbrirCameraChegada"
            );

        if (btnRegistrar) {

            btnRegistrar.addEventListener(
                "click",
                registrarChegadaManual
            );

        }

        if (btnCamera) {

            btnCamera.addEventListener(
                "click",
                iniciarCameraChegada
            );

        }

    }
);

async function registrarChegadaManual() {

    const codigo =
        document
            .getElementById(
                "codigoChegada"
            )
            .value
            .trim();

    await registrarChegada(
        codigo
    );

}

async function registrarChegada(
    codigo
) {

    if (!codigo) {

        mostrarToast(
            "Informe o código do volume.",
            "danger"
        );

        return;

    }

    const usuario =
        getUsuarioLogado();

    if (
        !usuario ||
        !["admin", "chegada"].includes(
            usuario.perfil
        )
    ) {

        mostrarToast(
            "Você não possui permissão.",
            "danger"
        );

        return;

    }

    try {

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
            volume.status !==
            "EM_TRANSPORTE"
        ) {

            mostrarToast(
                "Volume não está em transporte.",
                "danger"
            );

            return;

        }

        const agora =
            Date.now();

        let tempoMinutos =
            0;

        if (volume.saidaEm) {

            tempoMinutos =
                Math.floor(
                    (agora - volume.saidaEm)
                    / 60000
                );

        }

        await updateDoc(
            doc(
                db,
                "volumes",
                volume.id
            ),
            {
                status:
                    "ENTREGUE",

                chegadaEm:
                    agora,

                chegadaPor:
                    usuario.nome,

                chegadaCodigoFuncionario:
                    usuario.codigoInterno || "-",

                tempoTransporte:
                    tempoMinutos
            }
        );

        await addDoc(
            collection(
                db,
                "movimentacoes"
            ),
            {
                tipo:
                    "CHEGADA",

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
                    usuario.codigoInterno || "-"
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
                    "REGISTRAR_CHEGADA",

                detalhes:
                    `Chegada registrada para ${volume.codigo}`
            }
        );

        document.getElementById(
            "codigoChegada"
        ).value = "";

        mostrarToast(
            "Chegada registrada com sucesso.",
            "success"
        );

    } catch (erro) {

        console.error(
            erro
        );

        mostrarToast(
            "Erro ao registrar chegada.",
            "danger"
        );

    }

}

async function iniciarCameraChegada() {

    try {

        if (leitorChegada) {

            await leitorChegada.stop();

            leitorChegada.clear();

        }

        leitorChegada =
            new Html5Qrcode(
                "readerChegada"
            );

        await leitorChegada.start(
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
                    "codigoChegada"
                ).value =
                    decodedText;

                await leitorChegada.stop();

                leitorChegada.clear();

                leitorChegada = null;

                await registrarChegada(
                    decodedText
                );

            },
            () => {}
        );

        mostrarToast(
            "Leitor iniciado.",
            "info"
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
