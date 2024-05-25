
/**
 * Nome do arquivo: exemplo.js
 * Data de criação: 30/04/2024
 * Autor: João Silva
 * Matrícula: 123456
 *
 * Descrição:
 * Este arquivo JavaScript é responsável por implementar as funcionalidades
 * de interação do usuário com a interface gráfica do módulo de vendas.
 * Aqui são tratados eventos de cliques, validações de entrada e comunicação
 * com APIs para envio e recebimento de dados.
 *
 * Este script é parte o curso de ADS.
 */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { app, database } from "./../../services/firebase";
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";

const dbInstance = collection(database, "clientes");

export default async function handler(req, res) {
  if (req.method === "GET") {
    const id = req.query.id;
    
    try {
      if (!id) {
        const usuariosSnapshot = await getDocs(dbInstance);
        const usuarios = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(usuarios);
      } else {
        const usuarioDoc = await getDoc(doc(dbInstance, id));
        if (!usuarioDoc.exists()) {
          res.status(404).json({ message: "Usuário não encontrado." });
          return;
        }
        const usuario = usuarioDoc.data();
        res.status(200).json({ id: usuarioDoc.id, ...usuario });
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  } else if (req.method === "POST") {
    try {
      const { nome, email } = req.body;
      if (!nome || nome.trim() === "") {
        res.status(400).json({ message: "O nome é obrigatório!" });
        return;
      }
      if (!email || !isValidEmail(email)) {
        res.status(400).json({ message: "O email é obrigatório e deve ser válido!" });
        return;
      }
      await addDoc(dbInstance, { nome, email });
      res.status(201).json({ message: "Usuário adicionado com sucesso." });
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  } else if (req.method === "PUT") {
    try {
      const { id, nome, email } = req.body;
      if (!id) {
        res.status(400).json({ message: "É necessário fornecer o ID do usuário." });
        return;
      }
      const usuarioRef = doc(dbInstance, id);
      const usuarioDoc = await getDoc(usuarioRef);
      if (!usuarioDoc.exists()) {
        res.status(404).json({ message: "Usuário não encontrado." });
        return;
      }
      await updateDoc(usuarioRef, { nome, email });
      res.status(200).json({ message: "Usuário atualizado com sucesso." });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.body;
      if (!id) {
        res.status(400).json({ message: "É necessário fornecer o ID do usuário." });
        return;
      }
      const usuarioRef = doc(dbInstance, id);
      const usuarioDoc = await getDoc(usuarioRef);
      if (!usuarioDoc.exists()) {
        res.status(404).json({ message: "Usuário não encontrado." });
        return;
      }
      await deleteDoc(usuarioRef);
      res.status(200).json({ message: "Usuário excluído com sucesso." });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  } else {
    res.status(405).json({ message: "Método não permitido." });
  }
}

// Função para validar o formato do email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
