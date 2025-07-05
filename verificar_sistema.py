#!/usr/bin/env python3
"""
Script de verificação do sistema de licenciamento
"""

import os
import sys
import json
from license_manager import LicenseManager

def check_file(filename, description):
    """Verifica se um arquivo existe"""
    exists = os.path.exists(filename)
    status = "✅" if exists else "❌"
    print(f"{status} {description}: {filename}")
    return exists

def check_import(module_name):
    """Verifica se um módulo pode ser importado"""
    try:
        __import__(module_name)
        print(f"✅ Módulo {module_name} disponível")
        return True
    except ImportError:
        print(f"❌ Módulo {module_name} não encontrado")
        return False

def main():
    print("=" * 60)
    print("VERIFICAÇÃO DO SISTEMA DE LICENCIAMENTO")
    print("ENTALHE CNC CAM")
    print("=" * 60)
    
    all_ok = True
    
    # 1. Verificar arquivos essenciais
    print("\n1. 📁 ARQUIVOS ESSENCIAIS:")
    print("-" * 40)
    
    essential_files = [
        ("launcher.py", "Aplicativo principal"),
        ("license_manager.py", "Gerenciador de licenças"),
        ("generate_license.py", "Gerador de chaves"),
        ("build_installer.py", "Script de build"),
        ("valid_keys.json", "Base de chaves válidas"),
        ("requirements.txt", "Dependências Python"),
        ("INSTALADOR_README.md", "Documentação")
    ]
    
    for filename, description in essential_files:
        if not check_file(filename, description):
            all_ok = False
    
    # 2. Verificar dependências Python
    print("\n2. 🐍 DEPENDÊNCIAS PYTHON:")
    print("-" * 40)
    
    python_modules = [
        "tkinter",
        "hashlib",
        "json",
        "uuid",
        "datetime"
    ]
    
    for module in python_modules:
        if not check_import(module):
            all_ok = False
    
    # 3. Verificar funcionalidades do sistema
    print("\n3. ⚙️ FUNCIONALIDADES:")
    print("-" * 40)
    
    try:
        lm = LicenseManager()
        
        # Teste de geração de chave
        test_key = lm.generate_license_key("Teste Sistema", 1)
        print(f"✅ Geração de chaves: {test_key}")
        
        # Teste de validação
        is_valid, message = lm.validate_key(test_key)
        if is_valid:
            print(f"✅ Validação de chaves: {message}")
        else:
            print(f"❌ Validação de chaves: {message}")
            all_ok = False
        
        # Teste de ID da máquina
        machine_id = lm.generate_machine_id()
        print(f"✅ ID da máquina: {machine_id}")
        
        # Teste de hash
        key_hash = lm.hash_key(test_key)
        print(f"✅ Hash de chaves: {key_hash[:16]}...")
        
    except Exception as e:
        print(f"❌ Erro nas funcionalidades: {e}")
        all_ok = False
    
    # 4. Verificar estrutura do projeto
    print("\n4. 🏗️ ESTRUTURA DO PROJETO:")
    print("-" * 40)
    
    project_structure = [
        ("app", "Diretório do Next.js"),
        ("components", "Componentes React"),
        ("package.json", "Configuração Node.js"),
        ("next.config.js", "Configuração Next.js")
    ]
    
    for item, description in project_structure:
        check_file(item, description)
    
    # 5. Verificar chaves válidas
    print("\n5. 🔑 CHAVES VÁLIDAS:")
    print("-" * 40)
    
    try:
        with open("valid_keys.json", 'r') as f:
            valid_keys = json.load(f)
        
        print(f"✅ Total de chaves: {len(valid_keys)}")
        
        if valid_keys:
            print("📋 Chaves registradas:")
            for i, (key_hash, info) in enumerate(valid_keys.items(), 1):
                customer = info.get('customer', 'N/A')
                expires = info.get('expires', 'N/A')[:10]
                print(f"   {i}. {customer} (expira: {expires})")
        
    except Exception as e:
        print(f"❌ Erro ao ler chaves: {e}")
        all_ok = False
    
    # 6. Status da licença atual
    print("\n6. 📄 STATUS DA LICENÇA ATUAL:")
    print("-" * 40)
    
    try:
        lm = LicenseManager()
        is_licensed, message = lm.check_license()
        
        if is_licensed:
            print(f"✅ {message}")
            
            if os.path.exists("license.json"):
                with open("license.json", 'r') as f:
                    license_data = json.load(f)
                
                print(f"   Máquina: {license_data.get('machine_id', 'N/A')}")
                print(f"   Ativada: {license_data.get('activated_date', 'N/A')[:19]}")
        else:
            print(f"ℹ️ {message}")
    
    except Exception as e:
        print(f"❌ Erro ao verificar licença: {e}")
    
    # 7. Resultado final
    print("\n" + "=" * 60)
    if all_ok:
        print("🎉 SISTEMA COMPLETAMENTE FUNCIONAL!")
        print("✅ Todos os componentes estão funcionando corretamente")
        print("\nPróximos passos:")
        print("1. Execute 'python build_installer.py' para criar o instalador")
        print("2. Use 'python generate_license.py' para gerar chaves")
        print("3. Distribua o pacote gerado junto com as chaves")
    else:
        print("⚠️ ALGUNS PROBLEMAS ENCONTRADOS")
        print("❌ Verifique os itens marcados com ❌ acima")
        print("📖 Consulte o INSTALADOR_README.md para mais informações")
    
    print("=" * 60)
    
    return all_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
