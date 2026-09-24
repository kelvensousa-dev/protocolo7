import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { supabase } from '../src/lib/supabase';
import { Botao } from '../src/components/Botao';
import { Tela } from '../src/components/Tela';
import { cor, esp, txt } from '../src/theme';

export default function Login() {
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    setAviso(null);
    setEnviando(true);
    const credenciais = { email: email.trim(), password: senha };
    const { data, error } =
      modo === 'entrar'
        ? await supabase.auth.signInWithPassword(credenciais)
        : await supabase.auth.signUp(credenciais);
    setEnviando(false);
    if (error) return setAviso(error.message);
    if (modo === 'criar' && !data.session) setAviso('Confirme o e-mail que enviamos e depois entre.');
  };

  return (
    <Tela>
      <Text style={[txt.pacto, { marginTop: esp.xl }]}>Um compromisso por vez.</Text>
      <Text style={txt.corpo}>
        Para quem já tentou mudar muitas vezes. Aqui você faz um pacto pequeno, por 30 dias, e volta a confiar na
        própria palavra.
      </Text>

      <TextInput
        style={s.campo}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput style={s.campo} placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />
      {aviso && <Text style={txt.erro}>{aviso}</Text>}

      <Botao
        titulo={modo === 'entrar' ? 'Entrar' : 'Criar conta'}
        onPress={enviar}
        carregando={enviando}
        desativado={!email || senha.length < 6}
      />
      <Text style={txt.link} onPress={() => setModo(modo === 'entrar' ? 'criar' : 'entrar')}>
        {modo === 'entrar' ? 'Ainda não tenho conta' : 'Já tenho conta'}
      </Text>
    </Tela>
  );
}

const s = StyleSheet.create({
  campo: {
    borderBottomWidth: 1.5,
    borderColor: cor.tinta,
    paddingVertical: esp.s,
    fontSize: 18,
    color: cor.tinta,
  },
});
