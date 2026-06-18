import {
    db,
    collection,
    getDocs
} from "./firebase.js";

import {
    mostrarToast
} from "./utils.js";

let usuarioLogado = null;

export function getUsuarioLogado() {
    return usuarioLogado;
}

export async function iniciarAplicacao() {

    configurarLogin();

    configurarLogout();

    verificarSessao();

}

function configurarLogin() {

    const form =
        document.getElementById(
            "loginForm"
        );

    if (!form) return;

    form.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            await realizarLogin();

        }
    );

}

async function realizarLogin() {

    const usuario =
        document
            .getElementById(
                "loginUsuario"
            )
            .value
            .trim();

    const senha =
        document
            .getElementById(
                "loginSenha"
            )
            .value
            .trim();

    if (
        !usuario ||
        !senha
    ) {

        mostrarErro(
            "Informe usuário e senha."
        );

        return;

    }

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "usuarios"
                )
            );

        let encontrado =
            null;

        snapshot.forEach(
            (doc) => {

                const dados =
                    doc.data();

                if (
                    dados.usuario === usuario &&
                    dados.senha === senha
                ) {

                    encontrado = {
                        id: doc.id,
                        ...dados
                    };

                }

            }
        );

        if (!encontrado) {

            mostrarErro(
                "Usuário ou senha inválidos."
            );

            return;

        }

        usuarioLogado =
            encontrado;

        localStorage.setItem(
            "usuarioLogado",
            JSON.stringify(
                encontrado
            )
        );

        entrarSistema();

        mostrarToast(
            "Login realizado com sucesso.",
            "success"
        );

    } catch (erro) {

        console.error(
            erro
        );

        mostrarErro(
            "Erro ao realizar login."
        );

    }

}

function verificarSessao() {

    const sessao =
        localStorage.getItem(
            "usuarioLogado"
        );

    if (!sessao)
        return;

    try {

        usuarioLogado =
            JSON.parse(
                sessao
            );

        entrarSistema();

    } catch {

        localStorage.removeItem(
            "usuarioLogado"
        );

    }

}

function entrarSistema() {

    document
        .getElementById(
            "loginSection"
        )
        .classList
        .add("hidden");

    document
        .getElementById(
            "appSection"
        )
        .classList
        .remove("hidden");

    document
        .getElementById(
            "usuarioNomeTopo"
        )
        .textContent =
        usuarioLogado.nome;

    document
        .getElementById(
            "usuarioPerfilTopo"
        )
        .textContent =
        usuarioLogado.perfil;

    aplicarPermissoes();

}

function aplicarPermissoes() {

    const perfil =
        usuarioLogado.perfil;

    document
        .querySelectorAll(
            ".admin-only"
        )
        .forEach((el) => {

            el.style.display =
                perfil === "admin"
                    ? ""
                    : "none";

        });

    document
        .querySelectorAll(
            ".saida-only"
        )
        .forEach((el) => {

            el.style.display =
                perfil === "saida" ||
                perfil === "admin"
                    ? ""
                    : "none";

        });

    document
        .querySelectorAll(
            ".chegada-only"
        )
        .forEach((el) => {

            el.style.display =
                perfil === "chegada" ||
                perfil === "admin"
                    ? ""
                    : "none";

        });

    document
        .querySelectorAll(
            ".descarte-only"
        )
        .forEach((el) => {

            el.style.display =
                perfil === "descarte" ||
                perfil === "admin"
                    ? ""
                    : "none";

        });

}

function configurarLogout() {

    const btn =
        document.getElementById(
            "btnLogout"
        );

    if (!btn) return;

    btn.addEventListener(
        "click",
        logout
    );

}

function logout() {

    localStorage.removeItem(
        "usuarioLogado"
    );

    location.reload();

}

function mostrarErro(
    texto
) {

    const erro =
        document.getElementById(
            "loginErro"
        );

    erro.innerHTML =
        texto;

    erro.classList.remove(
        "hidden"
    );

}
