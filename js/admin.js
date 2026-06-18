import {
    db,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "./firebase.js";

import {
    gerarCodigoFuncionario,
    mostrarToast
} from "./utils.js";

import {
    getUsuarioLogado
} from "./auth.js";

let usuarioEditandoId = null;

document.addEventListener(
    "DOMContentLoaded",
    () => {

        configurarAdmin();

    }
);

function configurarAdmin() {

    const btnNovo =
        document.getElementById(
            "btnNovoFuncionario"
        );

    const form =
        document.getElementById(
            "formFuncionario"
        );

    const fechar =
        document.getElementById(
            "fecharModalFuncionario"
        );

    if (btnNovo) {

        btnNovo.addEventListener(
            "click",
            abrirModalFuncionario
        );

    }

    if (fechar) {

        fechar.addEventListener(
            "click",
            fecharModalFuncionario
        );

    }

    if (form) {

        form.addEventListener(
            "submit",
            salvarFuncionario
        );

    }

    carregarFuncionarios();

}

function abrirModalFuncionario() {

    usuarioEditandoId = null;

    document.getElementById(
        "formFuncionario"
    ).reset();

    document
        .getElementById(
            "modalFuncionario"
        )
        .classList
        .remove("hidden");

}

function fecharModalFuncionario() {

    document
        .getElementById(
            "modalFuncionario"
        )
        .classList
        .add("hidden");

}

async function salvarFuncionario(e) {

    e.preventDefault();

    const usuarioAtual =
        getUsuarioLogado();

    if (
        !usuarioAtual ||
        usuarioAtual.perfil !== "admin"
    ) {

        mostrarToast(
            "Apenas administrador pode cadastrar funcionários.",
            "danger"
        );

        return;

    }

    const nome =
        document
            .getElementById(
                "funcionarioNome"
            )
            .value
            .trim();

    const usuario =
        document
            .getElementById(
                "funcionarioUsuario"
            )
            .value
            .trim();

    const senha =
        document
            .getElementById(
                "funcionarioSenha"
            )
            .value
            .trim();

    const perfil =
        document
            .getElementById(
                "funcionarioPerfil"
            )
            .value;

    if (
        !nome ||
        !usuario ||
        !senha ||
        !perfil
    ) {

        mostrarToast(
            "Preencha todos os campos.",
            "danger"
        );

        return;

    }

    try {

        const dadosFuncionario = {
            nome,
            usuario,
            senha,
            perfil,
            codigoInterno:
                gerarCodigoFuncionario(),
            ativo: true,
            criadoEm: Date.now(),
            criadoPor:
                usuarioAtual.nome || "Admin"
        };

        await addDoc(
            collection(
                db,
                "usuarios"
            ),
            dadosFuncionario
        );

        await addDoc(
            collection(
                db,
                "auditoria"
            ),
            {
                data: Date.now(),
                usuario:
                    usuarioAtual.nome,
                codigoFuncionario:
                    usuarioAtual.codigoInterno || "-",
                perfil:
                    usuarioAtual.perfil,
                acao:
                    "CRIAR_FUNCIONARIO",
                detalhes:
                    `Criou usuário ${nome} com perfil ${perfil}`
            }
        );

        mostrarToast(
            "Funcionário cadastrado com sucesso.",
            "success"
        );

        fecharModalFuncionario();

        await carregarFuncionarios();

    } catch (erro) {

        console.error(erro);

        mostrarToast(
            "Erro ao salvar funcionário.",
            "danger"
        );

    }

}

async function carregarFuncionarios() {

    const tabela =
        document.getElementById(
            "usuariosTabela"
        );

    if (!tabela) return;

    tabela.innerHTML =
        `<tr><td colspan="6">Carregando...</td></tr>`;

    try {

        const snap =
            await getDocs(
                collection(
                    db,
                    "usuarios"
                )
            );

        tabela.innerHTML = "";

        if (snap.empty) {

            tabela.innerHTML =
                `<tr><td colspan="6">Nenhum funcionário cadastrado.</td></tr>`;

            return;

        }

        snap.forEach((documento) => {

            const u =
                documento.data();

            const tr =
                document.createElement(
                    "tr"
                );

            tr.innerHTML = `
                <td>${u.nome || "-"}</td>
                <td>${u.usuario || "-"}</td>
                <td>${u.codigoInterno || "-"}</td>
                <td>${u.perfil || "-"}</td>
                <td>${u.ativo ? "Ativo" : "Inativo"}</td>
                <td>
                    <button class="btn btn-secondary btn-small" data-toggle="${documento.id}">
                        ${u.ativo ? "Desativar" : "Ativar"}
                    </button>
                    <button class="btn btn-danger btn-small" data-delete="${documento.id}">
                        Excluir
                    </button>
                </td>
            `;

            tabela.appendChild(tr);

        });

        tabela
            .querySelectorAll(
                "[data-toggle]"
            )
            .forEach((btn) => {

                btn.addEventListener(
                    "click",
                    () =>
                        alternarStatusFuncionario(
                            btn.dataset.toggle
                        )
                );

            });

        tabela
            .querySelectorAll(
                "[data-delete]"
            )
            .forEach((btn) => {

                btn.addEventListener(
                    "click",
                    () =>
                        excluirFuncionario(
                            btn.dataset.delete
                        )
                );

            });

    } catch (erro) {

        console.error(erro);

        tabela.innerHTML =
            `<tr><td colspan="6">Erro ao carregar funcionários.</td></tr>`;

    }

}

async function alternarStatusFuncionario(id) {

    try {

        const snap =
            await getDocs(
                collection(
                    db,
                    "usuarios"
                )
            );

        let usuario =
            null;

        snap.forEach((d) => {

            if (d.id === id) {

                usuario = {
                    id: d.id,
                    ...d.data()
                };

            }

        });

        if (!usuario) return;

        await updateDoc(
            doc(
                db,
                "usuarios",
                id
            ),
            {
                ativo:
                    !usuario.ativo
            }
        );

        mostrarToast(
            "Status atualizado.",
            "success"
        );

        await carregarFuncionarios();

    } catch (erro) {

        console.error(erro);

        mostrarToast(
            "Erro ao alterar status.",
            "danger"
        );

    }

}

async function excluirFuncionario(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este funcionário?"
        );

    if (!confirmar) return;

    try {

        await deleteDoc(
            doc(
                db,
                "usuarios",
                id
            )
        );

        mostrarToast(
            "Funcionário excluído.",
            "success"
        );

        await carregarFuncionarios();

    } catch (erro) {

        console.error(erro);

        mostrarToast(
            "Erro ao excluir funcionário.",
            "danger"
        );

    }

}
