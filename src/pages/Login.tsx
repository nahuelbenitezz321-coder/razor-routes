import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-background">
      <div className="mb-8 text-center">
        <img src="/logo-jr.jpg" alt="JR Barbería" className="mx-auto mb-4 h-24 w-24 rounded-full object-cover ring-4 ring-primary shadow-2xl" />
        <h1 className="text-4xl text-primary">JR BARBERÍA</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestión integral para tu barbería</p>
      </div>

      <Card className="w-full max-w-sm border-border bg-card">
        <CardContent className="p-6">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Ingresar</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-3">
              <Input placeholder="Email" type="email" />
              <Input placeholder="Contraseña" type="password" />
              <Button className="w-full">Ingresar</Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-3">
              <Input placeholder="Nombre completo" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Contraseña" type="password" />
              <Input placeholder="Código de invitación (opcional)" />
              <Button className="w-full">Crear cuenta</Button>
              <p className="text-xs text-center text-muted-foreground">
                Sin código, se creará una nueva barbería
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
