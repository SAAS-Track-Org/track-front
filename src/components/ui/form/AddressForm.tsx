import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useCep } from "@/hooks/useCep";
import type { AddressDetail } from "@/types/types";
import styles from "./Addressform.module.css";

export const EMPTY_ADDRESS: AddressDetail = {
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  country: "Brasil",
};

interface AddressFormProps {
  address: AddressDetail;
  onChange: (address: AddressDetail) => void;
  addressError?: string | null;
  onClearError?: () => void;
}

export function AddressForm({
  address,
  onChange,
  addressError,
  onClearError,
}: AddressFormProps) {
  const { loading: cepLoading, error: cepError, fetchCep } = useCep();

  const handleCepChange = async (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    onChange({ ...address, zipCode: digits });

    if (digits.length === 8) {
      const result = await fetchCep(digits);
      if (result) {
        onChange({
          ...address,
          zipCode:      digits,
          street:       result.street,
          neighborhood: result.neighborhood,
          city:         result.city,
          state:        result.state,
        });
      }
    }
  };

  function set(field: keyof AddressDetail, value: string) {
    onClearError?.();
    onChange({ ...address, [field]: value });
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.sectionLabel}>Endereço</span>

      {addressError && (
        <span className={styles.addressError}>⚠ {addressError}</span>
      )}

      {/* CEP no topo com dica de autopreenchimento */}
      <Field
        label="CEP"
        error={cepError ?? undefined}
        hint="Preencha o CEP para autocompletar os campos abaixo"
      >
        <div className={styles.cepWrap}>
          <Input
            placeholder="01310-100"
            value={address.zipCode.replace(/(\d{5})(\d)/, "$1-$2")}
            onChange={(e) => handleCepChange(e.target.value)}
            maxLength={9}
          />
          {cepLoading && <span className={styles.cepSpinner} />}
        </div>
      </Field>

      <div className={styles.addressGrid}>

        {/* Rua — obrigatório, span2 */}
        <Field
          label="Rua *"
          span2
          error={addressError && !address.street.trim() ? " " : undefined}
        >
          <Input
            error={!!(addressError && !address.street.trim())}
            placeholder="Rua das Flores"
            value={address.street}
            onChange={(e) => set("street", e.target.value)}
          />
        </Field>

        {/* Número — obrigatório */}
        <Field
          label="Número *"
          error={addressError && !address.number.trim() ? " " : undefined}
        >
          <Input
            error={!!(addressError && !address.number.trim())}
            placeholder="123"
            value={address.number}
            onChange={(e) => set("number", e.target.value)}
          />
        </Field>

        {/* Bairro — obrigatório */}
        <Field
          label="Bairro *"
          error={addressError && !address.neighborhood.trim() ? " " : undefined}
        >
          <Input
            error={!!(addressError && !address.neighborhood.trim())}
            placeholder="Centro"
            value={address.neighborhood}
            onChange={(e) => set("neighborhood", e.target.value)}
          />
        </Field>

        {/* Complemento — opcional */}
        <Field label="Complemento">
          <Input
            placeholder="Apto 4"
            value={address.complement}
            onChange={(e) => set("complement", e.target.value)}
          />
        </Field>

        {/* Cidade — opcional */}
        <Field label="Cidade">
          <Input
            placeholder="São Paulo"
            value={address.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </Field>

        {/* Estado — opcional */}
        <Field label="Estado">
          <Input
            placeholder="SP"
            maxLength={2}
            value={address.state}
            onChange={(e) => set("state", e.target.value.toUpperCase())}
          />
        </Field>

      </div>
    </div>
  );
}