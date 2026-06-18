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

let leitorSaida = null;

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const btnRegistrar =
            document.getElementById(
                "btnRegistrarSaida"
            );

        const btnCamera =
            document.getElementById(
                "btnAbrirCameraSaida"
            );

        if (btnRegistrar) {

            btnRegistrar.addEventListener(
                "click",
                registrarSaidaManual
            );

        }

        if (btnCamera) {

            btnCamera.addEventListener(
                "click",
                iniciarCameraSaida
            );

        }

    }
);

async function registrarSaidaManual() {

    const codigo =
        document
            .getElementById(
                "codigoSaida"
            )
            .value
            .trim();

    await registrarSaida(
        codigo
    );

}

async function registrarSaida(
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
        !["admin", "saida"].includes(
            usuario.perfil
        )
    ) {

        mostrarToast(
            "Você não tem permissão para registrar saída.",
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
            "AGUARDANDO"
        ) {

            mostrarToast(
                "Este volume não está aguardando saída.",
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
                    "EM_TRANSPORTE",
                saidaEm:
                    agora,
                saidaPor:
                    usuario.nome,
                saidaCodigoFuncionario:
                    usuario.codigoInterno || "-"
            }
        );

        await addDoc(
            collection(
                db,
                "movimentacoes"
            ),
            {
                tipo:
                    "SAIDA",
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
                codigoFuncionario:
                    usuario.codigoInterno || "-",
                perfil:
                    usuario.perfil,
                acao:
                    "REGISTRAR_SAIDA",
                detalhes:
                    `Saída registrada para ${volume.codigo}`
            }
        );

        document.getElementById(
            "codigoSaida"
        ).value = "";

        mostrarToast(
            "Saída registrada com sucesso.",
            "success"
        );

    } catch (erro) {

        console.error(
            erro
        );

        mostrarToast(
            "Erro ao registrar saída.",
            "danger"
        );

    }

}

async function iniciarCameraSaida() {

    try {

        if (leitorSaida) {

            await leitorSaida.stop();

            leitorSaida.clear();

        }

        leitorSaida =
            new Html5Qrcode(
                "readerSaida"
            );

        await leitorSaida.start(
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
                    "codigoSaida"
                ).value =
                    decodedText;

                await leitorSaida.stop();

                leitorSaida.clear();

                leitorSaida = null;

                await registrarSaida(
                    decodedText
                );

            },
            () => {}
        );

        mostrarToast(
            "Câmera iniciada.",
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
